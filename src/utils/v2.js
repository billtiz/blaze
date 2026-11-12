'use strict';

/**
 * Native Discord Components V2 helper utilities.
 *
 * Replaces the old auto-conversion shim with direct V2 component building.
 * Every outgoing message should use these helpers instead of EmbedBuilder.
 *
 * Components V2 uses the IS_COMPONENTS_V2 message flag (1 << 15) and a flat
 * component tree: Container > [TextDisplay | MediaGallery | Section | ActionRow | Separator].
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

// ─── Component type constants ────────────────────────────────────────────────
const TYPE = Object.freeze({
  ActionRow:    1,
  Button:       2,
  StringSelect: 3,
  Section:      9,
  TextDisplay: 10,
  Thumbnail:   11,
  MediaGallery: 12,
  Separator:   14,
  Container:   17,
});

// Discord MessageFlags.IsComponentsV2
const COMPONENTS_V2_FLAG = 1 << 15;

// Default accent colours (as decimal integers)
const COLORS = Object.freeze({
  RED:    0xff0000,
  GREEN:  0x00ff00,
  YELLOW: 0xffaa00,
  BLUE:   0x5865F2,
  DEFAULT: 0xff0000,  // matches client.ankushcolor
});

// ─── Colour helpers ──────────────────────────────────────────────────────────

/**
 * Parse a colour value into an integer suitable for accent_color.
 * Accepts: hex string ('#ff0000'), integer, colour name from COLORS, or null.
 */
function parseColor(color) {
  if (color === null || color === undefined) return undefined;
  if (typeof color === 'number') return color;
  if (typeof color === 'string') {
    const upper = color.toUpperCase().replace('#', '');
    if (COLORS[upper] !== undefined) return COLORS[upper];
    const parsed = parseInt(upper, 16);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

// ─── Primitive component builders ────────────────────────────────────────────

/** Create a TextDisplay component. */
function text(content) {
  return { type: TYPE.TextDisplay, content: String(content) };
}

/** Create a MediaGallery with a single image/video. */
function mediaGallery(url) {
  if (!url) return null;
  return {
    type: TYPE.MediaGallery,
    items: [{ media: { url } }],
  };
}

/** Create a Thumbnail component. */
function thumbnail(url) {
  if (!url) return null;
  return {
    type: TYPE.Thumbnail,
    media: { url },
  };
}

/** Create a Section (up to 3 TextDisplay + optional Thumbnail accessory). */
function section({ texts = [], accessoryUrl = null }) {
  const components = (Array.isArray(texts) ? texts : [texts])
    .filter(Boolean)
    .map(t => (typeof t === 'string' ? text(t) : t));

  const sec = { type: TYPE.Section, components };
  if (accessoryUrl) {
    sec.accessory = thumbnail(accessoryUrl);
  }
  return sec;
}

/** Create a Separator. */
function separator({ spacing = 1, divider = true } = {}) {
  return { type: TYPE.Separator, spacing, divider };
}

/** Serialize a discord.js builder or plain object to JSON. */
function toJSON(component) {
  if (!component) return null;
  if (typeof component.toJSON === 'function') return component.toJSON();
  return component;
}

// ─── Container builder ───────────────────────────────────────────────────────

/**
 * Build a Container component.
 *
 * @param {Object} options
 * @param {string|number} [options.color]     - Accent colour (hex string or int)
 * @param {Array}          options.components  - Child components (TextDisplay, MediaGallery, Section, ActionRow, Separator)
 * @returns {Object} Container component
 */
function container({ color, components = [] } = {}) {
  const accentColor = parseColor(color);
  const children = components.map(toJSON).filter(Boolean);

  return {
    type: TYPE.Container,
    ...(accentColor !== undefined ? { accent_color: accentColor } : {}),
    components: children,
  };
}

// ─── High-level message builders ─────────────────────────────────────────────

/**
 * Build a complete V2 message payload ready for channel.send() / interaction.reply().
 *
 * @param {Object} options
 * @param {string|number}  [options.color]       - Container accent colour
 * @param {string}         [options.title]       - Title text (rendered as heading)
 * @param {string}         [options.description] - Main body text
 * @param {Array<{name,value}>} [options.fields] - Field-like entries (rendered as bold name + value)
 * @param {string}         [options.thumbnailUrl]- Thumbnail URL (shown in Section with description)
 * @param {string}         [options.imageUrl]    - Large image URL (shown as MediaGallery)
 * @param {string}         [options.footer]      - Footer text (rendered as subtext)
 * @param {string}         [options.timestamp]   - ISO timestamp or 'now'
 * @param {Array}          [options.actionRows]  - ActionRowBuilder instances or plain ActionRow objects
 * @param {boolean}        [options.ephemeral]   - Whether the message should be ephemeral
 * @returns {Object} Message payload for .send() / .reply() / .editReply()
 */
function v2Message({
  color,
  title,
  description,
  fields,
  thumbnailUrl,
  imageUrl,
  footer,
  timestamp,
  actionRows = [],
  ephemeral = false,
} = {}) {
  const children = [];

  // Build the heading text block (title + description combined)
  const headingParts = [];
  if (title) headingParts.push(`# ${title}`);
  if (description) headingParts.push(description);
  const headingText = headingParts.join('\n');

  // If we have a thumbnail, wrap heading in a Section with thumbnail accessory
  if (thumbnailUrl && headingText) {
    children.push(section({
      texts: [headingText],
      accessoryUrl: thumbnailUrl,
    }));
  } else if (headingText) {
    children.push(text(headingText));
  }

  // Fields → separate TextDisplay per field
  if (fields && fields.length > 0) {
    const fieldText = fields
      .filter(f => f && (f.name || f.value))
      .map(f => {
        const name = f.name ? `**${f.name}**` : '';
        const value = f.value || '';
        return [name, value].filter(Boolean).join('\n');
      })
      .join('\n');
    if (fieldText) children.push(text(fieldText));
  }

  // Image → MediaGallery
  const img = mediaGallery(imageUrl);
  if (img) children.push(img);

  // Footer + timestamp
  const footerParts = [];
  if (footer) footerParts.push(footer);
  if (timestamp) {
    const ts = timestamp === 'now' ? Date.now() : Date.parse(timestamp);
    if (Number.isFinite(ts)) footerParts.push(`<t:${Math.floor(ts / 1000)}:f>`);
  }
  if (footerParts.length) children.push(text(`-# ${footerParts.join(' • ')}`));

  // ActionRows
  for (const row of actionRows) {
    children.push(toJSON(row));
  }

  // Wrap in container
  const containerComp = container({ color, components: children });

  // Build flags
  let flags = COMPONENTS_V2_FLAG;
  if (ephemeral) flags |= (1 << 6); // MessageFlags.Ephemeral

  return {
    components: [containerComp],
    flags,
  };
}

// ─── Convenience shortcuts ───────────────────────────────────────────────────

/** Quick error message (red accent). */
function v2Error(description, { ephemeral = false } = {}) {
  return v2Message({ color: COLORS.RED, description, ephemeral });
}

/** Quick success message (green accent). */
function v2Success(description, { ephemeral = false } = {}) {
  return v2Message({ color: COLORS.GREEN, description, ephemeral });
}

/** Quick info message (default accent). */
function v2Info(description, { color = COLORS.DEFAULT, ephemeral = false } = {}) {
  return v2Message({ color, description, ephemeral });
}

/**
 * Build a simple text-only V2 payload (no container frills) for plain content.
 */
function v2Content(content) {
  return {
    components: [container({ components: [text(content)] })],
    flags: COMPONENTS_V2_FLAG,
  };
}

/**
 * Build a webhook-safe message payload using a regular embed.
 * Webhooks do NOT support the IS_COMPONENTS_V2 flag, so we must
 * fall back to a standard EmbedBuilder for webhook sends.
 */
function webhookMessage({ color, title, description, fields, thumbnailUrl, imageUrl, footer, timestamp } = {}) {
  const { EmbedBuilder } = require('discord.js');
  const embed = new EmbedBuilder();

  const accentColor = parseColor(color);
  if (accentColor !== undefined) embed.setColor(accentColor);
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (fields && fields.length > 0) embed.addFields(fields.filter(f => f && (f.name || f.value)));
  if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);
  if (imageUrl) embed.setImage(imageUrl);
  if (footer) embed.setFooter({ text: footer });
  if (timestamp) {
    embed.setTimestamp(timestamp === 'now' ? new Date() : new Date(timestamp));
  } else {
    embed.setTimestamp();
  }

  return { embeds: [embed] };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  TYPE,
  COMPONENTS_V2_FLAG,
  COLORS,
  parseColor,
  text,
  mediaGallery,
  thumbnail,
  section,
  separator,
  container,
  toJSON,
  v2Message,
  v2Error,
  v2Success,
  v2Info,
  v2Content,
  webhookMessage,
};
