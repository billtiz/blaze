const { v2Message, v2Error, COLORS, COMPONENTS_V2_FLAG, container, text, section, mediaGallery, separator } = require('../utils/v2');
const axios = require('axios');

module.exports = class EmbedHandler {
    constructor(client) {
        this.client = client;
    }

    async build(track, player) {
        try {
            if (!track || !player) {
                return v2Error('No track or player information available.');
            }

            const volume = player?.volume || 100;
            const thumb = track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/maxresdefault.jpg`;
            
            return v2Message({
                color: COLORS.RED,
                title: track.title,
                description: `<a:Playing:1295493488548253786> Now Playing`,
                fields: [
                    { name: 'Artist', value: track.author || 'Unknown' },
                    { name: 'Duration', value: track.isStream ? '🔴 LIVE' : this.formatDuration(track.length) },
                    { name: 'Volume', value: `${volume}%` },
                ],
                thumbnailUrl: thumb,
            });
        } catch (error) {
            console.error(error);
            return v2Error('Failed to create track information embed.');
        }
    }

    async buildqueue1(tracks, result) {
        try {
            if (!tracks || !tracks.length) {
                return v2Error('No tracks in queue.');
            }

            const track = tracks[0];
            return v2Message({
                color: COLORS.RED,
                title: track.title.length > 25 ? track.title.slice(0, 25) + '...' : track.title,
                description: 'Queue Information',
                fields: [
                    { name: 'Artist', value: track.author || 'Unknown' },
                    { name: 'Track Count', value: tracks.length.toString() },
                ],
                thumbnailUrl: `https://img.youtube.com/vi/${track.identifier}/maxresdefault.jpg`,
            });
        } catch (error) {
            console.error(error);
            return v2Error('Failed to create queue information embed.');
        }
    }

    async buildqueue2(tracks, result) {
        try {
            if (!tracks || !result) {
                return v2Error('No playlist information available.');
            }

            return v2Message({
                color: COLORS.RED,
                title: result.playlistName,
                description: 'Playlist Information',
                fields: [
                    { name: 'Total Tracks', value: tracks.length.toString() },
                    { name: 'Playlist Type', value: 'Custom Playlist' },
                ],
            });
        } catch (error) {
            console.error(error);
            return v2Error('Failed to create playlist information embed.');
        }
    }

    async msg1(client, prefix) {
        try {
            if (!client || !client.prefix) {
                return v2Error('No prefix information available.');
            }

            return v2Message({
                color: COLORS.RED,
                title: 'Bot Prefix',
                description: `Current prefix: \`${client.prefix}\``,
            });
        } catch (error) {
            console.error(error);
            return v2Error('Failed to create prefix information embed.');
        }
    }

    async lyrics(client, message) {
        try {
            if (!client || !message || !client.manager) {
                return v2Error('Missing required information for lyrics.');
            }

            const player = client.manager.players.get(message.guild.id);
            if (!player || !player.queue.current) {
                return v2Error('No song is currently playing.');
            }

            const songName = player.queue.current.title || "Unknown";
            const authorName = player.queue.current.author || "Unknown";
            
            const song = encodeURIComponent(songName);
            const author = encodeURIComponent(authorName);
            
            const response = await axios.get(
                `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${song}&q_artist=${author}&apikey=${process.env.MUSIXMATCH_API_KEY}`
            );
            
            const lyrics = response.data.message.body?.lyrics?.lyrics_body || "No lyrics found.";
            
            return v2Message({
                color: COLORS.RED,
                title: `Lyrics for ${songName}`,
                description: lyrics,
                fields: [{ name: 'Artist', value: authorName }],
            });
        } catch (error) {
            console.error(error);
            return v2Error('Failed to fetch lyrics.');
        }
    }

    async generateQueueEmbed(page, track, player) {
        try {
            if (!player || !player.queue) {
                return v2Error('No queue information available.');
            }

            const tracksPerPage = 5;
            const start = (page - 1) * tracksPerPage;
            const end = page * tracksPerPage;
            const tracks = player.queue.slice(start, end);
            
            let desc = `Showing tracks ${start + 1}-${Math.min(end, player.queue.length)} of ${player.queue.length}\n\n`;
            
            tracks.forEach((track, index) => {
                desc += `**${start + index + 1}. ${track.title}**\n`;
                desc += `Artist: ${track.author}\n`;
                desc += `Duration: ${track.isStream ? '🔴 LIVE' : this.formatDuration(track.length)}\n`;
                desc += `Requested by: ${track.requester.tag}\n\n`;
            });

            return v2Message({
                color: COLORS.RED,
                title: 'Current Queue',
                description: desc,
            });
        } catch (error) {
            console.error(error);
            return v2Error('Failed to create queue embed.');
        }
    }

    async nowplaying(player, track) {
        try {
            if (!player || !player.queue || !player.queue.current) {
                return v2Error('No track is currently playing.');
            }

            const current = player.queue.current;
            const volume = player?.volume || 100;
            const thumb = current.thumbnail || `https://img.youtube.com/vi/${current.identifier}/maxresdefault.jpg`;

            return v2Message({
                color: COLORS.RED,
                title: 'Now Playing',
                description: `[${current.title}](${current.uri})`,
                fields: [
                    { name: 'Artist', value: current.author || 'Unknown' },
                    { name: 'Duration', value: current.isStream ? '🔴 LIVE' : this.formatDuration(current.length) },
                    { name: 'Requested By', value: current.requester.tag },
                    { name: 'Volume', value: `${volume}%` },
                    { name: 'Queue Length', value: `${player.queue.length} tracks` },
                ],
                thumbnailUrl: thumb,
            });
        } catch (error) {
            console.error(error);
            return v2Error('Failed to create now playing embed.');
        }
    }

    formatDuration(duration) {
        const minutes = Math.floor(duration / 60000);
        const seconds = ((duration % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    }
};