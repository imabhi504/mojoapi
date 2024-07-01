const redis = require("redis")
const REDIS_PORT = process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379;
const REDIS_HOST = process.env.REDIS_HOST ? process.env.REDIS_HOST : 'localhost';
const _ = require("lodash")

class RedisHandler {
    constructor(){
        this.redisClient = null
    }
    
    static getRedisClient() {
        if (_.isNil(this.redisClient)) {
            this.redisClient = redis.createClient(REDIS_PORT, REDIS_HOST);
        }
        return this.redisClient
    }
}
let takeLock = async (key, value, timeout) => {

    const myPromise = new Promise(function (resolve, reject) {
        RedisHandler.getRedisClient().SETNX(key, value, function (err, data) {
            if (err)
                reject(err)
            if (data === 1)
                resolve(true)
            else
                resolve(false)
        }
        )
    })
    let result = await myPromise
    if (result)
        RedisHandler.getRedisClient().expire(key, timeout)
    return result
}

let getKeys = async (key) => {
    const myPromise = new Promise(function (resolve, reject) {
        RedisHandler.getRedisClient().keys(key, function (err, keys) {
            if (err)
                reject(err)
            if (keys)
                resolve(keys)
            else
                resolve(false)
        })
    })
    let result = await myPromise
    return result
}

let releaseLock = async (key) => {
    const myPromise = new Promise(function (resolve, reject) {
        RedisHandler.getRedisClient().del(key, function (err, data) {
            if (err)
                reject(err)
            resolve(data)
        });
    });
    const ans = await myPromise
    return ans
}

let setKey = (key, value) => {
    return RedisHandler.getRedisClient().set(key, value)
}

/**
 *
 *
 * @param {*} key redis key
 * @param {*} value value of key
 * @param {*} timeout timeout for expiry in secs
 * @return {*} 
 */
let setKeyWithExpiry = (key, value, timeout) => {
    return RedisHandler.getRedisClient().setex(key, timeout, value)
}

let setExpiry = (key, timeout) => {
    return RedisHandler.getRedisClient().expire(key, timeout)
}

let getKey = async (key) => {
    const myPromise = new Promise(function (resolve, reject) {
        RedisHandler.getRedisClient().get(key, function (err, data) {
            if (err)
                reject(err)

            resolve(data)

        })

    })
    const ans = await myPromise
    return ans

}

let incrKey = async (key, value = 1) => {
    const myPromise = new Promise(function (resolve, reject) {
        RedisHandler.getRedisClient().incrby(key, value, function (err, data) {
            if (err)
                reject(err)

            resolve(data)

        })
    })

    const ans = await myPromise
    return ans
}

let decrKey = async (key, value = 1) => {
    const myPromise = new Promise(function (resolve, reject) {
        RedisHandler.getRedisClient().decrby(key, value, function (err, data) {
            if (err)
                reject(err)
            resolve(data)

        })
    })
    const ans = await myPromise
    return ans
}

module.exports = {
    takeLock,
    getKeys,
    releaseLock,
    setKey,
    setKeyWithExpiry,
    setExpiry,
    getKey,
    incrKey,
    decrKey
}