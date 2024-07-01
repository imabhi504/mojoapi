const userModel = require('../models/userModel.js');
// Add data to userModel
const createData = (bodyData, callback) => {
    userModel.create(bodyData, (err, result) => {
        callback(err, result);
    });
}

// get data / find by element - returns only one record
const getData = (bodyData, callback) => {
    userModel.findOne(bodyData, {
        password: 0
    }, (err, result) => {
        callback(err, result);
    });
}

// find data / find by element - returns only one record
const findData = (bodyData, callback) => {
    userModel.findOne(bodyData, (err, result) => {
        callback(err, result);
    });
}

// update only one record
const updateOne = (query, bodyData, options, callback) => {
    userModel.findOneAndUpdate(query, bodyData, options, (err, result) => {
        callback(err, result);
    });
}

// update only one record
const getDetails = (bodydata, options, callback) => {
    userModel.findOne(bodydata, options, {
        password: 0
    }, (err, result) => {
        callback(err, result);
    });
}

//
const getDetails_pagination = (bodydata, options, page, callback) => {
    userModel.findOne(bodydata, options, page, {
        password: 0
    }, (err, result) => {
        callback(err, result);
    });
}

//Find data with paginate
const findPaginate = (bodyData,options,callback) => {
    userModel.paginate(bodyData, options, (err, result) => {
        callback(err, result);
    });
}

//
const updateDetails = (query, bodydata, options, callback) => {
    userModel.findByIdAndUpdate(query, bodydata, options, (err, result) => {
        callback(err, result);
    });
}

//
const deleteDetails = (query, bodydata, options, callback) => {
    userModel.findByIdAndRemove(query, bodydata, options, (err, result) => {
        callback(err, result);
    });
}

// find by document id and update and push or pop item in array
const arrayUpdateRemove = (query, data, callback) => {
    userModel.findByIdAndUpdate(query, data, {
        safe: true,
        upsert: true
    }, (err, result) => {
        callback(err, result);
    });
}

// find by document id and array key and set item in array
const arrayUpdate = (query, data, callback) => {
    userModel.updateOne(query, data, {
        safe: true,
        upsert: true
    }, (err, result) => {
        callback(err, result);
    });
}

//
const getOnlyData = (data, options={}, callback) => {
    userModel.findOne(data, options,{lean:true},(err, result) => {
        callback(err, result);
    });
} 

const getAllData = (data, options, callback) => {
    userModel.find(data, options,{lean:true},(err, result) => {
        callback(err, result);
    });
} 

// Get all data with pagination using aggregate
const getPaginateDataWithAggregate = (bodyData, options, sort, callback) => {
    let mainQueryParmas = [];
    mainQueryParmas.push({$match: {"registered": '1'}});

    if(bodyData.outdateProfiles && bodyData.outdateProfiles == 1){
        mainQueryParmas.push({ "$match" :
             { $or: [
                    { "twitter.followers_updated" : { "$lte" : new Date(new Date().getTime() - 1000 * 3600 * 24 * 5)}, "twitter.followers_updated": { $exists: true  } },
                    { "facebook.followers_updated" : { "$lte" : new Date(new Date().getTime() - 1000 * 3600 * 24 * 5)}, "facebook.followers_updated": { $exists: true  } },
                    { "instagram.followers_updated" : { "$lte" : new Date(new Date().getTime() - 1000 * 3600 * 24 * 5)}, "instagram.followers_updated": { $exists: true  } },
                    { "blog.followers_updated" : { "$lte" : new Date(new Date().getTime() - 1000 * 3600 * 24 * 5)}, "blog.followers_updated": { $exists: true  } }
                ]
            }
        });
    }

    if(bodyData.status && bodyData.status.length>0){
        mainQueryParmas.push({$match: {status: { $in: bodyData.status}}});
    }

    if(bodyData.gender){
        mainQueryParmas.push(bodyData.gender);
    }
    if(bodyData.country){
        mainQueryParmas.push(bodyData.country);
    }
    if(bodyData.state){
        mainQueryParmas.push(bodyData.state);
    }
    if(bodyData.city){
        mainQueryParmas.push(bodyData.city);
    }

    if(bodyData.search){
        mainQueryParmas.push( {
            $match: {
                $or: [{
                        first_name: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        last_name: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    },{
                        full_name: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        email: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        country: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        state: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    },
                    {
                        city: {
                            $regex: bodyData.search,
                            $options: 'i'
                        },

                    }, {
                    alt_email: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        mobile: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        alt_mobile: {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'facebook.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'twitter.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'youtube.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'snapchat.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'instagram.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, 
                    {
                        'telegram.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, 
                    {
                        'tiktok.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'linkedin.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'blog.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'pinterest.genres': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'facebook.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'twitter.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'snapchat.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'instagram.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, 
                    {
                        'telegram.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, 
                    {
                        'tiktok.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'youtube.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'blog.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'linkedin.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }, {
                        'pinterest.Elv_social': {
                            $regex: bodyData.search,
                            $options: 'i'
                        }
                    }
                ],
            },
        });
    }

    if(bodyData.socialPlatform){
        mainQueryParmas.push(bodyData.socialPlatform);
    }

    if( bodyData.reachData){
        mainQueryParmas.push( bodyData.reachData);
    }

    if(bodyData.genresData){
        mainQueryParmas.push( bodyData.genresData);
    }

    if(bodyData.categoryData){
        mainQueryParmas.push( bodyData.categoryData);
    }

    if(bodyData.cost_deliverables){
        mainQueryParmas.push(bodyData.cost_deliverables);
        mainQueryParmas.push(bodyData.costDeleriableFilter);
    }

    
    mainQueryParmas.push({
        "$project": {
            "_id":1,
            "first_name": 1,
            "influencer_id": 1,
            "last_name":1,
            "status":1,
            "gender":1,
            "dob":1,
            "country":1,
            "state":1,
            "city":1,
            "address":1,
            "email":1,
            "alt_email":1,
            "isd_code":1,
            "mobile":1,
            "alt_isd_code":1,
            "isd_mobile":1,
            "note":1,
            "registered":1,
            "profile_pic":1,
            "email_verification":1,
            "is_verified":1,
            "campaign_notification":1,
            "payment_notification":1,
            "account_notification":1,
            "new_feature_notification":1,
            "interests":1,
            "language":1,
            "lifestage":1,
            "education":1,
            "bank_details":1,
            "payment_details":1,
            "facebook": {
              "$map": {
                "input": "$facebook",
                "as":"facebook",
                  "in": {
                      "id":"$$facebook.id",
                      "oauth_token": "$$facebook.oauth_token",
                      "first_name": "$$facebook.first_name",
                      "last_name": "$$facebook.last_name",
                      "name": "$$facebook.name",
                      "Elv_social": "$$facebook.Elv_social",
                      "elv_social": "$$facebook.elv_social",
                      "type": "$$facebook.type",
                      "link": "$$facebook.link",
                      "friends_count": "$$facebook.friends_count",
                      "profile_image_url": "$$facebook.profile_image_url",
                      "connection_type": "$$facebook.connection_type",
                      "category": "$$facebook.category",
                      "genres": "$$facebook.genres",
                      "is_auth_expired": "$$facebook.is_auth_expired",
                      "createdAt": "$$facebook.createdAt",
                      "added_via": "$$facebook.added_via",
                      "added_by": "$$facebook.added_by",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$facebook.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$facebook.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$facebook.followers_count"}
                         }
                      }
                      
                   }
    
              }
            },
            "twitter": {
              "$map": {
                  "input": "$twitter",
                  "as":"twitter",
                  "in": {
                      "oauth_token": "$$twitter.oauth_token",
                      "oauth_token_secret": "$$twitter.oauth_token_secret",
                      "id": "$$twitter.id",
                      "name": "$$twitter.name",
                      "Elv_social": "$$twitter.Elv_social",
                      "link": "$$twitter.link",
                      "elv_social": "$$twitter.elv_social",
                      "profile_location": "$$twitter.profile_location",
                      "bio": "$$twitter.bio",
                      "followers_count": "$$twitter.followers_count",
                      "friends_count": "$$twitter.friends_count",
                      "profile_image_url": "$$twitter.profile_image_url",
                      "connection_type": "$$twitter.connection_type",
                      "category": "$$twitter.category",
                      "genres": "$$twitter.genres",
                      "type": "$$twitter.type",
                      "is_auth_expired": "$$twitter.is_auth_expired",
                      "createdAt": "$$twitter.createdAt",
                      "added_via": "$$twitter.added_via",
                      "added_by": "$$twitter.added_by",
                      "userId": "$$twitter.userId",
                      "engagement": "$$twitter.engagement",
                      "engagement_post_count": "$$twitter.engagement_post_count",
                      "avg_like_count": "$$twitter.avg_like_count",
                      "avg_comment_count": "$$twitter.avg_comment_count",
                      "avg_view_count": "$$twitter.avg_view_count",
                      "avg_dislike_count": "$$twitter.avg_dislike_count",
                      "avg_share_count": "$$twitter.avg_share_count",
                      "engagement_rate": "$$twitter.engagement_rate",
                      "screen_name": "$$twitter.screen_name",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$twitter.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$twitter.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$twitter.followers_count"}
                         }
                      }
                   }
                }
            },
            "snapchat": {
              "$map": {
                  "input": "$snapchat",
                  "as":"snapchat",
                  "in": {
                      "name" : "$$snapchat.name",
                      "Elv_social" : "$$snapchat.Elv_social",
                      "elv_social" : "$$snapchat.elv_social",
                      "link" : "$$snapchat.link",
                      "category" : "$$snapchat.category",
                      "profile_image_url" : "$$snapchat.profile_image_url",
                      "connection_type" : "$$snapchat.connection_type",
                      "bio" : "$$snapchat.bio",
                      "genres" : "$$snapchat.genres",
                      "type" : "$$snapchat.type",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$snapchat.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$snapchat.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$snapchat.followers_count"}
                         }
                      }
                   }
                }
            },
            "instagram": {
              "$map": {
                  "input": "$instagram",
                  "as":"instagram",
                  "in": {
                      "type": "$$instagram.type",
                      "instagram_business_id": "$$instagram.instagram_business_id",
                      "pageid": "$$instagram.pageid",
                      "username": "$$instagram.username",
                      "Elv_social": "$$instagram.Elv_social",
                      "elv_social": "$$instagram.elv_social",
                      "id": "$$instagram.id",
                      "access_token": "$$instagram.access_token",
                      "oauth_token": "$$instagram.oauth_token",
                      "page_oauth_token": "$$instagram.page_oauth_token",
                      "page_name": "$$instagram.page_name",
                      "name": "$$instagram.name",
                      "connection_type": "$$instagram.connection_type",
                      "category_type": "$$instagram.category_type",
                      "profile_image_url": "$$instagram.profile_image_url",
                      "followers_count": "$$instagram.followers_count",
                      "bio": "$$instagram.bio",
                      "link": "$$instagram.link",
                      "category": "$$instagram.category",
                      "genres": "$$instagram.genres",
                      "avg_comment_count": "$$instagram.avg_comment_count",
                      "avg_like_count": "$$instagram.avg_like_count",
                      "avg_view_count": "$$instagram.avg_view_count",
                      "engagement": "$$instagram.engagement",
                      "engagement_post_count": "$$instagram.engagement_post_count",
                      "engagement_rate": "$$instagram.engagement_rate",
                      "engagement_updated": "$$instagram.engagement_updated",
                      "followers_updated": "$$instagram.followers_updated",
                      "adminCategory": "$$instagram.adminCategory",
                      "adminGenres": "$$instagram.adminGenres",
                      "avg_dislike_count": "$$instagram.avg_dislike_count",
                      "avg_share_count": "$$instagram.avg_share_count",
                      "userId": "$$instagram.userId",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$instagram.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$instagram.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$instagram.followers_count"}
                         }
                      }
                   }
                }
            },
            "tiktok": {
              "$map": {
                  "input": "$tiktok",
                  "as":"tiktok",
                  "in": {
                      "name" : "$$tiktok.name",
                      "Elv_social" : "$$tiktok.Elv_social",
                      "elv_social" : "$$tiktok.elv_social",
                      "link" : "$$tiktok.link",
                      "category" : "$$tiktok.category",
                      "profile_image_url" : "$$tiktok.profile_image_url",
                      "connection_type" : "$$tiktok.connection_type",
                      "bio" : "$$tiktok.bio",
                      "genres" : "$$tiktok.genres",
                      "type" : "$$tiktok.type",
                      "userId" : "$$tiktok.userId",
                      "engagement" : "$$tiktok.engagement",
                      "engagement_post_count" : "$$tiktok.engagement_post_count",
                      "avg_like_count" : "$$tiktok.avg_like_count",
                      "avg_comment_count" : "$$tiktok.avg_comment_count",
                      "avg_view_count" : "$$tiktok.avg_view_count",
                      "avg_dislike_count" : "$$tiktok.avg_dislike_count",
                      "avg_share_count" : "$$tiktok.avg_share_count",
                      "engagement_rate" : "$$tiktok.engagement_rate",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$tiktok.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$tiktok.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$tiktok.followers_count"}
                         }
                      }
                   }
                }
            },
            "youtube": {
              "$map": {
                  "input": "$youtube",
                  "as":"youtube",
                  "in": {
                      "id": "$$youtube.id",
                      "type": "$$youtube.type",
                      "link": "$$youtube.link",
                      "Elv_social": "$$youtube.Elv_social",
                      "elv_social": "$$youtube.elv_social",
                      "connection_type": "$$youtube.connection_type",
                      "category": "$$youtube.category",
                      "refresh_token": "$$youtube.refresh_token",
                      "access_token": "$$youtube.access_token",
                      "is_auth_expired": "$$youtube.is_auth_expired",
                      "createdAt": "$$youtube.createdAt",
                      "added_by": "$$youtube.added_by",
                      "name": "$$youtube.name",
                      "bio": "$$youtube.bio",
                      "profile_image_url": "$$youtube.profile_image_url",
                      "username": "$$youtube.username",
                      "followers_count": "$$youtube.followers_count",
                      "postCount": "$youtube.postCount",
                      "userId": "$$youtube.userId",
                      "engagement": "$$youtube.userId",
                      "engagement_post_count": "$$youtube.engagement_post_count",
                      "avg_like_count": "$$youtube.avg_like_count",
                      "avg_comment_count": "$$youtube.avg_comment_count",
                      "avg_view_count": "$$youtube.avg_view_count",
                      "avg_dislike_count": "$$youtube.avg_dislike_count",
                      "avg_share_count": "$$youtube.avg_share_count",
                      "engagement_rate": "$$youtube.engagement_rate",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$youtube.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$youtube.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$youtube.followers_count"}
                         }
                      }
                   }
                }
            },
            "linkedin": {
              "$map": {
                  "input": "$linkedin",
                  "as":"linkedin",
                  "in": {
                      "id" : "$$linkedin.id",
                      "oauth_token" : "$$linkedin.oauth_token",
                      "firstName" : "$$linkedin.firstName",
                      "lastName" : "$$linkedin.lastName",
                      "name" : "$$linkedin.name",
                      "Elv_social" : "$$linkedin.Elv_social",
                      "elv_social" : "$$linkedin.elv_social",
                      "link" : "$$linkedin.link",
                      "profile_image_url" : "$$linkedin.profile_image_url",
                      "bio" : "$$linkedin.bio",
                      "connection_type" : "$$linkedin.connection_type",
                      "category" : "$$linkedin.category",
                      "type" : "$$linkedin.type",
                      "genres" : "$$linkedin.genres",
                      "is_auth_expired" : "$$linkedin.is_auth_expired",
                      "createdAt" : "$$linkedin.createdAt",
                      "added_via" : "$$linkedin.added_via",
                      "added_by" : "$$linkedin.added_by",
                      "userId" : "$$linkedin.userId",
                      "followers_count" : "$$linkedin.followers_count",
                      "engagement" : "$$linkedin.engagement",
                      "engagement_post_count" : "$$linkedin.engagement_post_count",
                      "avg_like_count" : "$$linkedin.avg_like_count",
                      "avg_comment_count" : "$$linkedin.avg_comment_count",
                      "avg_view_count" : "$$linkedin.avg_view_count",
                      "avg_dislike_count" : "$$linkedin.avg_dislike_count",
                      "avg_share_count" : "$$linkedin.avg_share_count",
                      "engagement_rate" : "$$linkedin.engagement_rate",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$linkedin.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$linkedin.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$linkedin.followers_count"}
                         }
                      }
                   }
                }
            },
            "blog": {
              "$map": {
                  "input": "$blog",
                  "as":"blog",
                  "in": {
                      "name" : "$$blog.name",
                      "category" : "$$blog.category",
                      "followers_count" : "$$blog.followers_count",
                      "link" : "$$blog.link",
                      "genres" : "$$blog.genres",
                      "bio" : "$$blog.bio",
                      "connection_type" : "$$blog.connection_type",
                      "currency" : "$$blog.currency",
                      "cost" : "$$blog.cost",
                      "Elv_social" : "$$blog.Elv_social",
                      "Elv_name" : "$$blog.Elv_name",
                      "followers_updated" : "$$blog.followers_updated",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$blog.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$blog.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$blog.followers_count"}
                         }
                      }
                   }
                }
            },
            "telegram": {
              "$map": {
                  "input": "$telegram",
                  "as":"telegram",
                  "in": {
                      "name" : "$$telegram.name",
                      "Elv_social" : "$$telegram.Elv_social",
                      "elv_social" : "$$telegram.elv_social",
                      "link" : "$$telegram.link",
                      "category" : "$$telegram.category",
                      "profile_image_url" : "$$telegram.profile_image_url",
                      "connection_type" : "$$telegram.connection_type",
                      "bio" : "$$telegram.bio",
                      "genres" : "$$telegram.genres",
                      "type" : "$$telegram.type",
                      "followers_count":{
                        $switch: {
                            branches: [
                               { case: {$eq: ['$$telegram.followers_count', '']}, then: 0 },
                               { case: {$not: ['$$telegram.followers_count']}, then: 0 } ],
                            default: {'$toInt':"$$telegram.followers_count"}
                         }
                      }
                   }
                }
            },
          }
    })
    
    mainQueryParmas.push({ $sort: sort });
    if(bodyData.excelDownload && bodyData.excelDownload==1){
        userModel.aggregate(mainQueryParmas).exec((err, result) => {
            callback(err, result);
        });
    }else{
        var aggregateData = userModel.aggregate(mainQueryParmas).allowDiskUse(true);
        userModel.aggregatePaginate(aggregateData, options, (error, success, pages, total) => {
            callback(error, success, pages, total);
        });
    }
}

const getInfluencerData = (bodyData, options, callback) => {
    userModel.find(bodyData, options, (err, result) => {
        callback(err, result);
    });
}

const findUserData = (bodyData, options, callback) => {
    userModel.findOne(bodyData, options, (err, result) => {
        callback(err, result);
    });
}

// Find max reach (followers_count) in influecner collection for influecner
const getMaxReachCountInfluencer = (bodyData, callback) => {
   userModel.aggregate([
    {$match: {"registered": '1'}},
    {$match: {status:bodyData.status}},
    {
        "$addFields":{
            "facebook_followers_count_array": {
                "$map": {
                  "input": "$facebook",
                  "as":"facebook",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$facebook.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$facebook.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$facebook.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        "$addFields":{
            "twitter_followers_count_array": {
                "$map": {
                  "input": "$twitter",
                  "as":"twitter",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$twitter.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$twitter.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$twitter.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        "$addFields":{
            "instagram_followers_count_array": {
                "$map": {
                  "input": "$instagram",
                  "as":"instagram",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$instagram.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$instagram.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$instagram.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        "$addFields":{
            "linkedin_followers_count_array": {
                "$map": {
                  "input": "$linkedin",
                  "as":"linkedin",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$linkedin.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$linkedin.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$linkedin.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        "$addFields":{
            "youtube_followers_count_array": {
                "$map": {
                  "input": "$youtube",
                  "as":"youtube",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$youtube.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$youtube.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$youtube.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        "$addFields":{
            "blog_followers_count_array": {
                "$map": {
                  "input": "$blog",
                  "as":"blog",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$blog.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$blog.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$blog.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        "$addFields":{
            "snapchat_followers_count_array": {
                "$map": {
                  "input": "$snapchat",
                  "as":"snapchat",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$snapchat.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$snapchat.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$snapchat.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        "$addFields":{
            "telegram_followers_count_array": {
                "$map": {
                  "input": "$telegram",
                  "as":"telegram",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$telegram.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$telegram.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$telegram.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        "$addFields":{
            "tiktok_followers_count_array": {
                "$map": {
                  "input": "$tiktok",
                  "as":"tiktok",
                    "in": {
                        "followers_count":{
                            $switch: {
                                branches: [
                                   { case: {$eq: ['$$tiktok.followers_count', '']}, then: 0 },
                                   { case: {$not: ['$$tiktok.followers_count']}, then: 0 } ],
                                default: {'$toInt':"$$tiktok.followers_count"}
                             }
                        }
                    }
                }
            }
           
        }
    },
    {
        $addFields:{"max_facebook_followers_count": { $max: "$facebook_followers_count_array.followers_count" } }, 
    },
    {
        $addFields:{"max_twitter_followers_count": { $max: "$twitter_followers_count_array.followers_count" } },
    },
    {
        $addFields:{"max_instagram_followers_count": { $max: "$instagram_followers_count_array.followers_count" } },
    },
    {
        $addFields:{"max_linkedin_followers_count": { $max: "$linkedin_followers_count_array.followers_count" } },
    },
    {
        $addFields:{"max_youtube_followers_count": { $max: "$youtube_followers_count_array.followers_count" } },
    },
    {
        $addFields:{"max_blog_followers_count": { $max: "$blog_followers_count_array.followers_count" } },
    },
    {
        $addFields:{"max_snapchat_followers_count": { $max: "$snapchat_followers_count_array.followers_count" } },
    },
    {
        $addFields:{"max_telegram_followers_count": { $max: "$telegram_followers_count_array.followers_count" } },
    },
    {
        $addFields:{"max_tiktok_followers_count": { $max: "$tiktok_followers_count_array.followers_count" } }
    },
    {
        $addFields:{
            "max_tiktok":{
                "$cond": {
                    "if": {
                      "$not": ["$max_tiktok_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_tiktok_followers_count"
                      }
                 }
             }
        }
    },
    {
        $addFields:{
            "max_facebook":{
                "$cond": {
                    "if": {
                      "$not": ["$max_facebook_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_facebook_followers_count"
                      }
                 }
             },
        }
    },
    {
        $addFields:{
            "max_twitter":{
                "$cond": {
                    "if": {
                      "$not": ["$max_twitter_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_twitter_followers_count"
                      }
                 }
             },
        }
    },
    {
        $addFields:{
            "max_instagram":{
                "$cond": {
                    "if": {
                      "$not": ["$max_instagram_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_instagram_followers_count"
                      }
                 }
             },
        }
    },
    {
        $addFields:{
            "max_linkedin":{
                "$cond": {
                    "if": {
                      "$not": ["$max_linkedin_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_linkedin_followers_count"
                      }
                 }
             },
        }
    },
    {
        $addFields:{
            "max_youtube":{
                "$cond": {
                    "if": {
                      "$not": ["$max_youtube_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_youtube_followers_count"
                      }
                 }
             },
        }
    },{
        $addFields:{
            "max_blog":{
                "$cond": {
                    "if": {
                      "$not": ["$max_blog_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_blog_followers_count"
                      }
                 }
             },
        }
    },
    {
        $addFields:{
            "max_snapchat":{
                "$cond": {
                    "if": {
                      "$not": ["$max_snapchat_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_snapchat_followers_count"
                      }
                 }
             },
        }
    },
    {
        $addFields:{
            "max_telegram":{
                "$cond": {
                    "if": {
                      "$not": ["$max_telegram_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_telegram_followers_count"
                      }
                 }
             },
        }
    },{
        $addFields:{
            "max_tiktok":{
                "$cond": {
                    "if": {
                      "$not": ["$max_tiktok_followers_count"]
                    },
                    "then": 0,
                    "else":{
                        "$toInt":"$max_tiktok_followers_count"
                      }
                 }
             }
        }
    },
   {
        $group:{_id:"count_data",
        max_facebook:{$max:"$max_facebook"},
        max_twitter:{$max:"$max_twitter"},
        max_instagram:{$max:"$max_instagram"},
        max_linkedin:{$max:"$max_linkedin"},
        max_youtube:{$max:"$max_youtube"},
        max_blog:{$max:"$max_blog"},
        max_snapchat:{$max:"$max_snapchat"},
        max_telegram:{$max:"$max_telegram"},
        max_tiktok:{$max:"$max_tiktok"}
      }  
    },
    {
        $project:{
            _id: 'count_data',
            "max_facebook":1,
            "max_twitter":1,
            "max_instagram":1,
            "max_linkedin":1,
            "max_youtube":1,
            "max_blog":1,
            "max_snapchat":1,
            "max_telegram":1,
            "max_tiktok":1,
        }
    }
    
]).exec((error, result) => {
        callback(error, result);
    });
}

// update only one record
const updateDeviceInfo = (query, bodyData, options, callback) => {
    userModel.update(query, bodyData, options, (err, result) => {
        callback(err, result);
    });
}

// find only one record async
const findOneAsync = async (query, options = {}) => {
    return await userModel.findOne(query, options,{lean:true});
}
// update only one record
const updateOneAsync = async (query, bodyData, options={}) => {
    return await userModel.findOneAndUpdate(query, bodyData, options);
}

// find only one record async
const UserCount = (query,callback) => {
    userModel.count(query, (err, result) => {
        callback(err, result);
    });
}
// create only one record
const createOneAsync = async (bodyData) => {
    return await userModel.create(bodyData);
}

const getInfluencerPaginated = (bodyData, options, callback) => {
    let mainQueryParams = []
    let query = {}
    query['organisations'] = {$ne : bodyData.org_obj_id}
    
    mainQueryParams = [{$match : query}, {$project : options}];

    let pagination = {
        page: bodyData.pageNumber ? parseInt(bodyData.pageNumber) : 1,
        limit: bodyData.limit ? parseInt(bodyData.limit) : 10,                    
    }

    if (bodyData.kol_search) {   
        let kol_search = {
            $match: {
                $or: [{
                    "first_name": {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                }, {
                    "last_name": {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                }, {
                    "full_name": {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                }, {
                    "email": {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                }, {
                    "mobile": {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                }, {
                    'twitter.Elv_social' : {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                },
                {
                    'facebook.Elv_social' : {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                },
                {
                    'youtube.Elv_social' : {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                },
                {
                    'instagram.Elv_social' : {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                },
                {
                    'tiktok.Elv_social' : {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                },
                {
                    'blog.Elv_social' : {
                        $regex: bodyData.kol_search,
                        $options: 'i'
                    }
                },
            ]
            }
        }
        mainQueryParams.push(kol_search);
    }
    var aggregate = userModel.aggregate(mainQueryParams)
    userModel.aggregatePaginate(aggregate,pagination, (error, success, pages, total) => {
        callback(error, success, pages, total)
    })
}

// find records async
const findAsync = async (query, options = {}) => {
    return await userModel.find(query, options);
}

const deleteOneAsync = async (query) => {
    return await userModel.deleteOne(query);
}

// Export
module.exports = {
    createData,
    getData,
    updateOne,
    getDetails,
    updateDetails,
    deleteDetails,
    getDetails_pagination,
    findData,
    arrayUpdateRemove,
    getOnlyData,
    arrayUpdate,
    getPaginateDataWithAggregate,
    getInfluencerData,
    findUserData,
    getMaxReachCountInfluencer,
    updateDeviceInfo,
    findOneAsync,
    updateOneAsync,
    UserCount,
    getAllData,
    createOneAsync,
    getInfluencerPaginated,
    findAsync,
    deleteOneAsync,
    findPaginate
}