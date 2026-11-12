'use strict';

/**
 * Converts the project's existing message payloads to Discord Components V2 at
 * the last possible point before discord.js sends them to Discord. This keeps
 * every existing output path covered: channels, DMs, replies, webhook logs,
 * slash-command replies, follow-ups, component updates, and message edits.
 *
 * Components V2 messages cannot contain `content` or `embeds`, so legacy
 * payloads are represented by a Container with Text Display, Media Gallery,
 * Thumbnail, and Action Row components instead.
 */

const COMPONENT_TYPES = Object.freeze({
  ActionRow: 1,
  Section: 9,
  TextDisplay: 10,
  Thumbnail: 11,
  MediaGallery: 12,
  Container: 17,
});

// Discord's MessageFlags.IsComponentsV2 value. Keeping this local avoids a
// dependency on discord.js' public export shape while this module patches its
// internal MessagePayload class.
const COMPONENTS_V2_FLAG = 1 << 15;
const TEXT_DISPLAY_LIMIT = 4_000;

let installed = false;

function asText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function splitText(value, limit = TEXT_DISPLAY_LIMIT) {
  const text = asText(value);
  if (!text) return [];

  const chunks = [];
  let remaining = text;

  while (remaining.length > limit) {
    let splitAt = remaining.lastIndexOf('\n', limit);
    if (splitAt < Math.floor(limit / 2)) splitAt = remaining.lastIndexOf(' ', limit);
    if (splitAt < 1) splitAt = limit;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trimStart();
  }

  if (remaining) chunks.push(remaining);
  return chunks.filter(Boolean);
}

function textDisplays(value) {
  return splitText(value).map(content => ({ type: COMPONENT_TYPES.TextDisplay, content }));
}

function packTextBlocks(blocks, limit = TEXT_DISPLAY_LIMIT) {
  const packed = [];
  let current = '';

  for (const block of blocks.filter(Boolean)) {
    const separator = current ? '\n\n' : '';
    if (current && current.length + separator.length + block.length > limit) {
      packed.push(current);
      current = block;
    } else {
      current += `${separator}${block}`;
    }
  }

  if (current) packed.push(current);
  return packed;
}

function serializeComponent(component) {
  if (!component) return null;
  if (typeof component.toJSON === 'function') return component.toJSON();
  return component;
}

function cloneComponents(components) {
  return (components ?? []).map(serializeComponent).filter(Boolean);
}

function authorLine(author) {
  if (!author?.name) return '';
  const name = `**${author.name}**`;
  return author.url ? `[${name}](${author.url})` : name;
}

function titleLine(embed) {
  if (!embed?.title) return '';
  return embed.url ? `# [${embed.title}](${embed.url})` : `# ${embed.title}`;
}

function footerLine(embed) {
  const pieces = [];
  if (embed?.footer?.text) pieces.push(embed.footer.text);
  if (embed?.timestamp) {
    const timestamp = Date.parse(embed.timestamp);
    if (Number.isFinite(timestamp)) pieces.push(`<t:${Math.floor(timestamp / 1000)}:f>`);
  }
  return pieces.length ? `-# ${pieces.join(' • ')}` : '';
}

function fieldLines(fields = []) {
  const blocks = fields.flatMap(field => {
    const name = asText(field?.name);
    const value = asText(field?.value);
    if (!name && !value) return [];
    return splitText([name && `**${name}**`, value].filter(Boolean).join('\n'));
  });
  return packTextBlocks(blocks);
}

function mediaGallery(url) {
  if (!url) return null;
  return {
    type: COMPONENT_TYPES.MediaGallery,
    items: [{ media: { url } }],
  };
}

function embedComponents(embed) {
  if (!embed || typeof embed !== 'object') return [];

  const components = [];
  const headingParts = splitText([authorLine(embed), titleLine(embed), asText(embed.description)]
    .filter(Boolean)
    .join('\n'))
    .map(content => ({ type: COMPONENT_TYPES.TextDisplay, content }));

  // A Section can carry a thumbnail accessory while preserving up to three
  // independent text displays (author, title, and description).
  if (embed.thumbnail?.url && headingParts.length > 0 && headingParts.length <= 3) {
    components.push({
      type: COMPONENT_TYPES.Section,
      components: headingParts,
      accessory: {
        type: COMPONENT_TYPES.Thumbnail,
        media: { url: embed.thumbnail.url },
      },
    });
  } else {
    components.push(...headingParts);
    const thumbnail = mediaGallery(embed.thumbnail?.url);
    if (thumbnail) components.push(thumbnail);
  }

  const footer = footerLine(embed);
  const details = packTextBlocks([...fieldLines(embed.fields), ...splitText(footer)]);
  if (details.length) components.push(...details.map(content => ({ type: COMPONENT_TYPES.TextDisplay, content })));

  const image = mediaGallery(embed.image?.url ?? embed.video?.url);
  if (image) components.push(image);

  return components;
}

function hasV2Component(components) {
  return components.some(component => component?.type !== COMPONENT_TYPES.ActionRow);
}

function getTargetMessage(target) {
  if (!target || typeof target !== 'object') return null;
  if (Array.isArray(target.components)) return target;
  return target.message && Array.isArray(target.message.components) ? target.message : null;
}

function mergeActionRowsIntoCurrentMessage(target, actionRows) {
  const message = getTargetMessage(target);
  const current = cloneComponents(message?.components);
  if (!current.some(component => component.type === COMPONENT_TYPES.Container)) return null;

  let inserted = false;
  return current.map(component => {
    if (component.type !== COMPONENT_TYPES.Container) return component;

    const staticComponents = (component.components ?? []).filter(
      child => child.type !== COMPONENT_TYPES.ActionRow,
    );
    if (!inserted) {
      staticComponents.push(...actionRows);
      inserted = true;
    }
    return { ...component, components: staticComponents };
  });
}

function currentActionRows(target) {
  const message = getTargetMessage(target);
  const current = cloneComponents(message?.components);
  const actionRows = [];

  for (const component of current) {
    if (component.type === COMPONENT_TYPES.ActionRow) {
      actionRows.push(component);
    } else if (component.type === COMPONENT_TYPES.Container) {
      actionRows.push(...(component.components ?? []).filter(child => child.type === COMPONENT_TYPES.ActionRow));
    }
  }

  return actionRows;
}

/**
 * Converts a resolved discord.js API message body. Exported for regression
 * tests; normal callers should only use installComponentsV2().
 */
function convertMessageBodyToV2(body, target) {
  if (!body || typeof body !== 'object') return body;

  const hadContent = body.content !== undefined && body.content !== null && body.content !== '';
  const hadEmbeds = Array.isArray(body.embeds);
  const hadComponents = Array.isArray(body.components);
  const legacyComponents = cloneComponents(body.components);
  const hasPayload = hadContent || hadEmbeds || hadComponents;
  if (!hasPayload) return body;

  const embeds = body.embeds ?? [];
  const actionRowsOnly = legacyComponents.every(component => component.type === COMPONENT_TYPES.ActionRow);

  // A Components V2 message edit which changes only action rows must retain
  // the static components already present on the message. In a V1 embed this
  // happened implicitly; in V2 the full component tree is replaced.
  if (!hadContent && !hadEmbeds && actionRowsOnly) {
    const merged = mergeActionRowsIntoCurrentMessage(target, legacyComponents);
    if (merged) {
      body.components = merged;
      body.flags = (body.flags ?? 0) | COMPONENTS_V2_FLAG;
      return body;
    }
  }

  // Empty embeds/components deliberately clear an existing message. Do not
  // fabricate a placeholder component in that case.
  if (!hadContent && hadEmbeds && embeds.length === 0 && legacyComponents.length === 0) {
    delete body.content;
    delete body.embeds;
    const retainedRows = hadComponents ? [] : currentActionRows(target);
    body.components = retainedRows.length
      ? [{ type: COMPONENT_TYPES.Container, components: retainedRows }]
      : [];
    body.flags = (body.flags ?? 0) | COMPONENTS_V2_FLAG;
    return body;
  }

  if (hasV2Component(legacyComponents) && !hadContent && !hadEmbeds) {
    body.components = legacyComponents;
    body.flags = (body.flags ?? 0) | COMPONENTS_V2_FLAG;
    return body;
  }

  const children = [];
  if (hadContent) children.push(...textDisplays(body.content));
  for (const embed of embeds) children.push(...embedComponents(embed));
  children.push(...legacyComponents);
  // V1 edits that omit `components` leave existing controls in place. V2
  // updates replace the full component tree, so carry those action rows into
  // the freshly-built container to preserve that established behaviour.
  if (!hadComponents) children.push(...currentActionRows(target));

  // Discord requires a message to contain at least one component. A legacy
  // empty-content/empty-embed send was invalid too, so only preserve an empty
  // component list for edit semantics.
  if (children.length === 0) {
    delete body.content;
    delete body.embeds;
    body.components = [];
    body.flags = (body.flags ?? 0) | COMPONENTS_V2_FLAG;
    return body;
  }

  const accentColor = embeds.find(embed => Number.isInteger(embed?.color))?.color;
  body.components = [{
    type: COMPONENT_TYPES.Container,
    ...(accentColor === undefined ? {} : { accent_color: accentColor }),
    components: children,
  }];
  delete body.content;
  delete body.embeds;
  body.flags = (body.flags ?? 0) | COMPONENTS_V2_FLAG;
  return body;
}

function installComponentsV2() {
  if (installed) return;

  // MessagePayload is the common serialization path used by channel sends,
  // DMs, webhooks, message edits, and every interaction response type.
  // Patching it once makes it impossible for a command to accidentally send a
  // legacy embed payload.
  // discord.js intentionally exports only its public entry point. Resolve that
  // entry point first, then load the serializer from the same installed copy.
  // This avoids relying on an unsupported package subpath import.
  // eslint-disable-next-line global-require
  require('discord.js');
  // eslint-disable-next-line global-require
  const { dirname, join } = require('node:path');
  // eslint-disable-next-line global-require
  const MessagePayload = require(join(dirname(require.resolve('discord.js')), 'structures', 'MessagePayload.js'));
  const originalResolveBody = MessagePayload.prototype.resolveBody;

  MessagePayload.prototype.resolveBody = function resolveBodyWithComponentsV2() {
    const payload = originalResolveBody.call(this);
    convertMessageBodyToV2(payload.body, this.target);
    return payload;
  };

  installed = true;
}

module.exports = {
  COMPONENTS_V2_FLAG,
  COMPONENT_TYPES,
  convertMessageBodyToV2,
  installComponentsV2,
};
