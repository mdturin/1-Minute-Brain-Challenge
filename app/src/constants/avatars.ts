export type Avatar = { id: string; emoji: string; bg: string };

export const AVATARS: Avatar[] = [
  { id: 'oni',      emoji: '👹', bg: '#7f1d1d' },
  { id: 'goblin',   emoji: '👺', bg: '#14532d' },
  { id: 'skull',    emoji: '💀', bg: '#1c1917' },
  { id: 'robot',    emoji: '🤖', bg: '#1e3a5f' },
  { id: 'monster',  emoji: '👾', bg: '#3b0764' },
  { id: 'dragon',   emoji: '🐲', bg: '#064e3b' },
  { id: 'zombie',   emoji: '🧟', bg: '#1a2e05' },
  { id: 'wolf',     emoji: '🐺', bg: '#1e293b' },
  { id: 'scorpion', emoji: '🦂', bg: '#431407' },
  { id: 'bat',      emoji: '🦇', bg: '#2e1065' },
];

export function getAvatar(avatarId: string | undefined, uid: string): Avatar {
  if (avatarId) {
    const found = AVATARS.find((a) => a.id === avatarId);
    if (found) return found;
  }
  return AVATARS[uid.charCodeAt(0) % AVATARS.length]!;
}
