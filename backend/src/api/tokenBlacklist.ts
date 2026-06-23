/**
 * 内存 Token 黑名单
 * 用于服务端登出，使已发出的 token 立即失效
 * 生产环境建议替换为 Redis
 */
// 这里使用了一个 Set 来存储被注销的 token。Set 的特点是元素唯一，查找速度快，非常适合用来存储黑名单。
const blacklist = new Set<string>();

// 添加 token 到黑名单
export function addToBlacklist(token: string) {
  blacklist.add(token);
}

// 检查 token 是否在黑名单中
export function isBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
