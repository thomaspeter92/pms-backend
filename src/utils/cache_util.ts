import * as redis from "redis";

export class CacheUtil {
  private static client = redis.createClient();

  constructor() {
    CacheUtil.client.connect();
  }

  public static async get(cacheName: string, key: string) {
    try {
      const data = await CacheUtil.client.json.get(`${cacheName}:${key}`);
      return data;
    } catch (error) {
      console.error("Error getting cache", error);
      return null;
    }
  }

  public static async set(cacheName: string, key: string, value) {
    try {
      await CacheUtil.client.json.set(`${cacheName}:${key}`, ".", value);
    } catch (error) {
      console.error("Error getting cache", error);
    }
  }

  public static async remove(cacheName: string, key: string) {
    try {
      await CacheUtil.client.del(`${cacheName}:${key}`);
    } catch (error) {
      console.error("Error deleting cache", error);
    }
  }
}
