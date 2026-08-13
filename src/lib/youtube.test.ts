import { describe, expect, it } from 'vitest';
import { getYouTubeEmbedUrl } from './youtube';

describe('getYouTubeEmbedUrl', () => {
  it('converts a shorts URL (our real seed data format)', () => {
    expect(getYouTubeEmbedUrl('https://youtube.com/shorts/1hKp5_FtMdc')).toBe(
      'https://www.youtube.com/embed/1hKp5_FtMdc',
    );
  });

  it('converts a standard watch URL', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('converts a youtu.be short link', () => {
    expect(getYouTubeEmbedUrl('https://youtu.be/abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('passes through an already-embed URL unchanged', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/embed/abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('returns null for a non-YouTube URL', () => {
    expect(getYouTubeEmbedUrl('https://vimeo.com/12345')).toBeNull();
  });

  it('returns null for an invalid URL', () => {
    expect(getYouTubeEmbedUrl('not a url')).toBeNull();
  });
});
