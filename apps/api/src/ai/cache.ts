type Key = string;
export class LRU<V> {
  private m = new Map<Key, V>();
  constructor(private cap = 200) {}
  get(k: Key): V | undefined {
    const v = this.m.get(k);
    if (v !== undefined) {
      this.m.delete(k);
      this.m.set(k, v);
    }
    return v;
  }
  set(k: Key, v: V) {
    if (this.m.has(k)) this.m.delete(k);
    this.m.set(k, v);
    if (this.m.size > this.cap) this.m.delete(this.m.keys().next().value);
  }
}
export function makeKey(x: {
  caseId: string;
  npcId: string;
  node: string;
  flags: string[];
  q: string;
}) {
  const normQ = x.q.trim().toLowerCase().replace(/\s+/g, ' ');
  return `${x.caseId}|${x.npcId}|${x.node}|${x.flags.join(',')}|${normQ}`;
}
