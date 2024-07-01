const util = require('util');
const _ = require('lodash');
const request = require('request-promise');
const requestPromise = util.promisify(request);
const userService = require('../services/userServices.js');
const helper = require('../globalFunctions/function.js');
const responseHandle = require('../globalFunctions/responseHandle.js');
const responseCode = require('../globalFunctions/httpResponseCode.js');
const Promise = require("bluebird");
const { join } = require('lodash');
const loggingImproved = require('../libs/loggingImproved');
let jwt = require('jsonwebtoken')
const secret = process.env.SECRET_KEY;

/**
 * [Facebook Connect]
 * @param  {[type]} req [object received from the application.]
 * @param  {[type]} res [object to be sent as response from the api.]
 * @return {[type]}     [function call to return the appropriate response]
 */
const facebookConnect = function(req, res) {
    let handlerInfo = {
        apiModule: "facebook",
        apiHandler: "facebookConnect"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";

    try {
        let user_email = req.body.decoded.email.toLowerCase();
        var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name', 'gender', 'picture', 'friends', 'accounts'];
        var accessTokenUrl = 'https://graph.facebook.com/v2.8/oauth/access_token';
        var graphApiUrl = 'https://graph.facebook.com/v2.8/me?fields=' + fields.join(',');
        var params = {
            code: req.body.code,
            client_id: process.env.FBCLIENT_ID,
            client_secret: process.env.FBCLIENT_SECRET,
            //redirect_uri: req.body.redirectUri
            redirect_uri:process.env.FB_REDIRECT_URI
        };
        request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
            if (response.statusCode !== 200) {
                return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, 'Access token error');
            }
            // Step 2. Retrieve profile information about the current user.
            request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
                if (response.statusCode !== 200) {
                    return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, 'Profile error');
                }
                let profileData = profile;
                profile.accessToken = accessToken.access_token;
                let myquery = {
                    email: { $ne: user_email },
                    'facebook.id': profile.id
                };
                userService.findData(myquery, (err, userInfo) => {
                    if (err) {
                        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, "Something Went Wrong!", err);
                    } else {
                        if (userInfo) {
                            return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.ALREADY_EXIST, 'Please try with diffrent account, this account is already exists');
                        } else {
                            // Saving data
                            let query = {
                                email: user_email,
                                'facebook.id': profile.id
                            };
    
                            userService.findData(query, async (error_, userInfo1) => {
                                if (error_) {
                                    return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, "Something Went Wrong!", error_);
                                } else {
                                    if (userInfo1) {
                                        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.ALREADY_EXIST, 'You already have this account mentioned on your profile');
                                    } else {
                                        var query1 = {
                                            email: user_email,
                                        }
                                        profile.Elv_social = profile.name;
                                        let insertData = {
                                            "id" : profile.id,
                                            "oauth_token" : accessToken.access_token,
                                            "first_name": profile.first_name,
                                            "last_name": profile.last_name,
                                            "name": profile.name,
                                            "Elv_social": profile.name,
                                            "type" : "profile",
                                            "link" : profile.link,
                                            "followers_count" : profile.friends,
                                            "friends_count" :profile.friends,
                                            "profile_image_url" : profile.picture? profile.picture.data.url:'',
                                            "connection_type" : "auto",
                                            "category" : "",
                                            "genres" : []
    
                                        }
                                        var data = {
                                            $push: {
                                                facebook: insertData
                                            }
                                        }
                                        userService.updateOne(query1, data, {
                                            new: true
                                        }, async(error, updatedResp) => {
                                            if (error) {
                                                return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, "Something Went Wrong!", error);
                                            } else {
                                                facebookDataSave(handlerInfo, user_email, profile.id, accessToken.access_token,'user',profile.name);
                                                let req_data = {
                                                    "profile":profileData,
                                                    "accessToken":accessToken.access_token,
                                                    "source":"facebook"
                                                }
                                                helper.savePlatformData(req_data);
                                                if(profile.accounts && profile.accounts.data){
                                                    let pages_data = profile.accounts.data;
                                                    let pageUrl = 'https://graph.facebook.com/me?fields=id,name,username,picture&access_token=';
                                                    pages_data.forEach(async (page,i) =>{
                                                        let url = pageUrl + page.access_token;
                                                        let response = await requestPromise({url, timeout:20000,agent: false, pool: {maxSockets: 100}});
                                                        let facebookData = JSON.parse(response.body);
                                                        var profilePic = "";
                                                        if(facebookData && facebookData.picture && facebookData.picture.data && facebookData.picture.data.url){
                                                             profilePic = facebookData.picture.data.url
                                                        }
                                                        let insertData = {
                                                            "id" : page.id,
                                                            "oauth_token" : page.access_token,
                                                            "name" : page.name,
                                                            "Elv_social" :  facebookData.username ? facebookData.username:page.name,
                                                            "type" : "page",
                                                            "page_category" : page.category,
                                                            "category_list" : page.category_list,
                                                            "tasks" : page.tasks,
                                                            "connection_type" : "auto",
                                                            "category" : "",
                                                            "profile_image_url" :profilePic,
                                                            "followers_count" : 0,
                                                            "link" : "",
                                                            "genres" : [],
                                                            "user_id" : profile.id,
                                                            "user_oauth_token": accessToken.access_token
                                                        }
                                                        let updateObj = { $addToSet: {"facebook": insertData } }
                                                        if(page.id){
                                                                let findPage = {
                                                                email: user_email,
                                                                'facebook.id': page.id
    
                                                                };
                                                                userService.findData(findPage, (error_, pageInfo) => {
                                                                    if(!error_ && !pageInfo){
                                                                        userService.updateDeviceInfo({email: user_email}, updateObj, (err, result) => {
                                                                            if (err) {
                                                                            //return responseHandle.sendResponsewithError(res, 500, err);
                                                                                loggingImproved.error(handlerInfo, {ERROR: err})
                                                                            }else{
                                                                                let name = facebookData.username ? facebookData.username:page.name
                                                                                facebookDataSave(handlerInfo, user_email, page.id, page.access_token,'page',name);
                                                                            }
                                                                        })
                                                                    }
                                                            })
                                                        }
                                                    })
    
                                                }
                                                responseHandle.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'Your account has been added successfully', updatedResp);
                                                let getPermissionUrl = 'https://graph.facebook.com/';
                                                let uriData = getPermissionUrl + profile.id + '/permissions?access_token='+accessToken.access_token;
    
                                                const options = {
                                                    uri: uriData,
                                                    method: 'DELETE',
                                                    json:true
                                                };
                                                await request(options);
                                            }
                                        });
                                    }
    
                                }
                            });
    
                        }
                    }
                });
            });
        });
    } catch (err) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, err)
    }
}

/**
 * [Facebook outh API]
 * @param  {[type]} req [object received from the application.]
 * @param  {[type]} res [object to be sent as response from the api.]
 * @return {[type]}     [function call to return the appropriate response]
 */
const facebookCodeURI = function(req, res) {
    let handlerInfo = {
        apiModule: "facebook",
        apiHandler: "facebookCodeURI"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";

    try {
        var codeUrl = 'https://www.facebook.com/dialog/oauth';
      //  let code_url = codeUrl + '?client_id=' + process.env.FBCLIENT_ID + '&redirect_uri=' + process.env.FB_REDIRECT_URI;
        let code_url = codeUrl + '?client_id=' + process.env.FBCLIENT_ID + '&redirect_uri=' + process.env.FB_REDIRECT_URI + '&scope=user_posts,manage_pages';
       return res.status(200).send({ code_url });
    } catch (err) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, err)
    }
}

const facebookDataSave = async (handlerInfo, user_email, social_id, access_token,type,name) =>{
    let pageApiUrl = "";
    if(type == 'page')
        pageApiUrl="https://graph.facebook.com/v10.0/"+ social_id+ "/tagged?fields=from,full_picture,permalink_url,message,created_time&access_token=";
        //pageApiUrl="https://graph.facebook.com/"+ social_id+ "/feed?fields=full_picture,permalink_url,message,created_time,likes{name,id,username,picture},comments{id,message,comments{likes}}&access_token=";
    else
        pageApiUrl="https://graph.facebook.com/"+ social_id+ "/feed?fields=full_picture,permalink_url,message,created_time,comments{id,message,comments{likes}}&access_token=";
    let url = pageApiUrl + access_token;
    let response = await requestPromise({url, timeout:20000,agent: false, pool: {maxSockets: 100}});
    let facebookData = JSON.parse(response.body);
    let userData = await userService.findOneAsync({'email':user_email});
    saveCraweldData(handlerInfo, user_email,userData, 'facebook', name);
    if(facebookData && facebookData.data && facebookData.data.length){
        let queryData ={'influecer_social_id':social_id}
        await hubService.deleteRecord(queryData);
        let dataArray = facebookData.data;
        dataArray.forEach(async (obj,i) =>{
            if(obj.full_picture || obj.message){
                let insertData = {
                    'influencer_id':userData._id,
                    'influecer_social_id':social_id,
                    'post_id':obj.id,
                    'media_url':obj.full_picture ?obj.full_picture :'',
                    'message':obj.message ?obj.message :'',
                    'permalink':obj.permalink_url ?obj.permalink_url :'',
                    'feed_date':obj.created_time ?new Date(obj.created_time) :new Date(),
                    'influecer_social_name':name,
                    'platform':'facebook',
                    'type':type,
                    'created_by':obj.from ? obj.from : {}
                }
                hubService.createData(insertData,(error, success) =>{
                    return success;
                });
            }
        });
    }
};

/**
 * [Facebook mobile Connect]
 * @param  {[type]} req [object received from the application.]
 * @param  {[type]} res [object to be sent as response from the api.]
 * @return {[type]}     [function call to return the appropriate response]
 */
const facebookConnectMobile = async (req, res) => {
    let handlerInfo = {
        apiModule: "facebook",
        apiHandler: "facebookConnectMobile"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";

    try {
        
        let fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name', 'gender', 'picture', 'friends', 'accounts'];
        let accessTokenUrl = 'https://graph.facebook.com/v2.8/oauth/access_token';
        let graphApiUrl = 'https://graph.facebook.com/v2.8/me?fields=' + fields.join(',');
        let platform = 'facebook';
        let updateStatus = false;
        if(req.body.accessToken){
            
            let accessToken = req.body.accessToken;
            const paramsData = {
                access_token: accessToken
            };
            request.get({ url: graphApiUrl, qs: paramsData, json: true }, async (err, response, profile) =>{
                if (response.statusCode !== 200) {
                    return responseHandle.sendResponsewithError(
                        handlerInfo,
                        res, 
                        responseCode.INTERNAL_SERVER_ERROR, 
                        'Profile not found'
                    );
                }
                let profileData = profile;

                
                let user_email = profile.email.toLowerCase();
                let addedBy = {
                    user_type : 2,
                    email: user_email
                };
                profile.accessToken = accessToken;

                let myquery = {
                    'influencer_id': profile.id
                };
                userService.findData(myquery, async (err, userInfo) => {
                    if (err) {
                        return responseHandle.sendResponsewithError(
                            handlerInfo,
                            res, 
                            responseCode.INTERNAL_SERVER_ERROR, 
                            "Something Went Wrong!", 
                            err
                        );
                    } else {
                                        let token = jwt.sign({ id: profile.id },
                                                            secret, {
                                                                expiresIn: '24h' // expires in 24 hours
                                                            }
                                                        );
                                        
                                        let result = {
                                            ...profile,
                                            token:token
                                        }                
                                        profile.Elv_social = profile.name.toLowerCase();
                                        let joinName = profile.name.split(' ').join('-') + '-'+profile.id;
                                        let insertData = {
                                            "influencer_id" : profile.id,
                                            "oauth_token" : accessToken,
                                            "first_name": profile.first_name,
                                            "last_name": profile.last_name,
                                            "name": profile.name,
                                            //"Elv_social": profile.name.toLowerCase(),
                                            "Elv_social": joinName,
                                            "elv_social": joinName,
                                            "type" : "profile",
                                            "link" : profile.link || "https://www.facebook.com/profile.php?id="+profile.id,
                                            "followers_count" : profile.friends || 0,
                                            "friends_count" :profile.friends || 0,
                                            "profile_image_url" : profile.picture? profile.picture.data.url:'',
                                            "connection_type" : "auto",
                                            "category" : "",
                                            "genres" : [],
                                            "is_auth_expired":false
                                        };
                                        if(userInfo){
                                            insertData = {
                                                ...insertData,
                                                updatedAt:new Date(),
                                                updated_by:user_email && user_email != null ? addedBy: ""
                                            }
                                            await userService.updateOneAsync(myquery, insertData);
                                            updateStatus = true;
                                            
                                        }else{
                                            insertData = {
                                                ...insertData,
                                                createdAt:new Date(),
                                                added_via:3,
                                                added_by:user_email && user_email != null ? addedBy: ""
                                            }
                                           console.log('insertData',insertData,myquery) 
                                        userService.createData(insertData);
                                    }



                                                if(profile.accounts && profile.accounts.data){
                                                    let pages_data = profile.accounts.data;
                                                    let pageUrl = 'https://graph.facebook.com/me?fields=id,name,username,picture,followers_count&access_token=';
                                                    return Promise.map(pages_data, async(page,i) => {
                                                        let url = pageUrl + page.access_token;
                                                        let response = await requestPromise({url, timeout:20000,agent: false, pool: {maxSockets: 100}});
                                                        let facebookData = JSON.parse(response.body);
                                                        var profilePic = "";
                                                        if(facebookData && facebookData.picture && facebookData.picture.data && facebookData.picture.data.url){
                                                            profilePic = facebookData.picture.data.url
                                                        }
                                                        profilePic = `https://graph.facebook.com/${page.id}/picture?type=large`;
                                                        let pageName = facebookData.username ? facebookData.username:page.name.split(' ').join('-') + '-'+page.id;
                                                        if(page.id){
                                                            let findPage = {
                                                            influencer_id: profile.id,
                                                            'facebook.id': page.id
                                                            };
                                                            let options = {_id: 0, [(platform)+".$"]: 1};
                                                            userService.getDetails(findPage,options, async(error_, pageInfo) => {
                                                                if(error_){
                                                                    loggingImproved.error(handlerInfo, {ERROR: error_.message});
                                                                    responseMessage = "Something Went Wrong!";
                                                                }
                                                                else if(!pageInfo){
                                                                    let insertData = {
                                                                        "id" : page.id,
                                                                        "oauth_token" : page.access_token,
                                                                        "name" : page.name,
                                                                        ///"Elv_social" :  facebookData.username ? facebookData.username.toLowerCase():page.name.toLowerCase(),
                                                                        "Elv_social" : facebookData.username ? facebookData.username.toLowerCase():page.name.split(' ').join('-') + '-'+page.id,
                                                                        "elv_social" : facebookData.username ? facebookData.username.toLowerCase():page.name.split(' ').join('-') + '-'+page.id,
                                                                        "type" : "page",
                                                                        "page_category" : page.category,
                                                                        "category_list" : page.category_list,
                                                                        "tasks" : page.tasks,
                                                                        "connection_type" : "auto",
                                                                        "category" : "",
                                                                        "profile_image_url" :profilePic || "",
                                                                        "followers_count" : facebookData.followers_count ? facebookData.followers_count : 0,
                                                                        "link" : "https://www.facebook.com/"+ pageName,
                                                                        "genres" : [],
                                                                        "user_id" : profile.id,
                                                                        "is_auth_expired":false,
                                                                        //"user_oauth_token": accessToken,
                                                                        createdAt:new Date(),
                                                                        added_via:3,
                                                                        added_by:user_email && user_email != null ? addedBy: ""
                                                                    };
                                                                    let updateObj = { $addToSet: {"facebook": insertData } }
                                                                    userService.updateDeviceInfo({influencer_id: profile.id}, updateObj, (err, result) => {
                                                                        if (err) {
                                                                            loggingImproved.error(handlerInfo, {ERROR: err.message});
                                                                        }else{
                                                                            // let name = facebookData.username ? facebookData.username:page.name
                                                                            // facebookDataSave(handlerInfo, user_email, page.id, page.access_token,'page',name);
                                                                        }
                                                                    });
                                                                }else if(pageInfo){
                                                                    let social_data = pageInfo[platform][0];
                                                                    let updateData = {
                                                                        '$set': 
                                                                            {
                                                                                [`${platform}.$.id`]: page.id,
                                                                                [`${platform}.$.oauth_token`]:page.access_token,
                                                                                [`${platform}.$.name`]: (page.name) ? page.name : social_data.name ,
                                                                                [`${platform}.$.Elv_social`] :  facebookData.username ? facebookData.username.toLowerCase():page.name.toLowerCase(),
                                                                                [`${platform}.$.elv_social`]: facebookData.username ? facebookData.username.toLowerCase():page.name.split(' ').join('-') + '-'+page.id,
                                                                                [`${platform}.$.followers_count`]: facebookData.followers_count ? facebookData.followers_count : social_data.followers_count,
                                                                                [`${platform}.$.type`]: 'page',
                                                                                [`${platform}.$.page_category`] : page.category,
                                                                                [`${platform}.$.category_list`] : page.category_list,
                                                                                [`${platform}.$.tasks`] : page.tasks,
                                                                                [`${platform}.$.category`]: social_data.category,
                                                                                [`${platform}.$.profile_image_url`]: (profilePic) ? profilePic : social_data.profile_image_url,
                                                                                [`${platform}.$.link`]: "https://www.facebook.com/"+ pageName,
                                                                                [`${platform}.$.bio`]: (social_data.bio) ? social_data.bio : '',
                                                                                [`${platform}.$.connection_type`]:'auto',
                                                                                [`${platform}.$.genres`]: (social_data.genres) ? social_data.genres : [],
                                                                                [`${platform}.$.user_id`]: profile.id,
                                                                                [`${platform}.$.is_auth_expired`]:false,
                                                                                [`${platform}.$.updatedAt`]:new Date(),
                                                                                [`${platform}.$.updated_by`]:user_email && user_email != null ? addedBy: ""
                                                                            }
                                                                    };
                                                                    userService.updateDeviceInfo(findPage, updateData, (err, result) => {
                                                                        if (err) {
                                                                            loggingImproved.error(handlerInfo, {ERROR: err.message});
                                                                        }else{
                                                                            updateStatus = true;
                                                                            // let name = facebookData.username ? facebookData.username:page.name
                                                                            // facebookDataSave(user_email, page.id, page.access_token,'page',name);
                                                                        }
                                                                    }) 
                                                                }else{
                                                                }
                                                            })
                                                        }
                                                        return page;
                                                    })
                                                    .then((results1) => {
                                                        // helper.userUpdateDate(user_email,2);
                                                        if(updateStatus)
                                                            return responseHandle.sendResponseWithData(
                                                                res, 
                                                                responseCode.EVERYTHING_IS_OK, 
                                                                'Your account has been updated successfully',
                                                                result
                                                            );
                                                        else
                                                            // organisationController.sendFirstTimeLogInNotification(handlerInfo, user_email, "facebook", profile.id).then((res) => {}).catch((e) => {
                                                            //     loggingImproved.error(handlerInfo, {ERROR: e.message})
                                                            // })
                                                            return responseHandle.sendResponseWithData(
                                                                res, 
                                                                responseCode.EVERYTHING_IS_OK, 
                                                                'Your account has been added successfully',
                                                                result
                                                            );
                                                    })
                                                    .catch((e) => {
                                                        return responseHandle.sendResponsewithError(
                                                            handlerInfo,
                                                            res, 
                                                            responseCode.INTERNAL_SERVER_ERROR, 
                                                            'Something went wrong',
                                                            e
                                                        );
                                                    });
                                                }

                                                   // helper.userUpdateDate(user_email,2);
                                                   if(updateStatus)
                                                    return responseHandle.sendResponseWithData(
                                                        res, 
                                                        responseCode.EVERYTHING_IS_OK, 
                                                        'Your account has been updated successfully',
                                                        result
                                                    );
                                                else
                                                    // organisationController.sendFirstTimeLogInNotification(handlerInfo, user_email, "facebook", profile.id).then((res) => {}).catch((e) => {
                                                    //     loggingImproved.error(handlerInfo, {ERROR: e.message})
                                                    // })
                                                    return responseHandle.sendResponseWithData(
                                                        res, 
                                                        responseCode.EVERYTHING_IS_OK, 
                                                        'Your account has been added successfully',
                                                        result
                                                    );
                                            }
                                                 
                                               
                                                    });
                                                })
                
        }else{
            return responseHandle.sendResponsewithError(
                handlerInfo,
                res, 
                responseCode.NOT_FOUND, 
                'Please Porvide token'
            );
        }
    } catch (err) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, err)
    }
};

//GET username manual
const getUserName = async (name,id) => {
    let nameWithId ='';
    let joinName = name.split(' ').join('-');
    nameWithId = joinName + '-'+id;
    return nameWithId;
};
//Save facebook data in crawel influencer
const saveCraweldData = async (handlerInfo, user_email,userData,platform, name) => {
    if(user_email && userData && userData[platform] && name){
        let platform_social = `${platform}.Elv_social`;
        let craweldInfluencer = await crawledInfluencerModel.findOne({ [platform_social]: name });
        if(!_.isNil(craweldInfluencer) && craweldInfluencer.elv_registered == 0 && craweldInfluencer[platform].length){
            let craweledPlatformData = craweldInfluencer[platform];
            let platformData = userData[platform];
            if(platformData.findIndex(item => item.Elv_social === name)){
                platformData = await platformData.filter(item => item.Elv_social === name);
                craweledPlatformData = await craweledPlatformData.filter(itemData => itemData.Elv_social === name);
                if(platformData.length && platformData[0] && craweledPlatformData && craweledPlatformData[0]){
                    let platfromCraledData = craweledPlatformData[0];
                    let updateData = {
                        "elv_registered":1,
                        "first_name":userData.first_name,
                        "last_name":userData.last_name,
                        "full_name":userData.full_name,
                        "email":(userData.email) ? userData.email:craweldInfluencer.email,
                        "alt_email":(userData.alt_email) ? userData.alt_email: craweldInfluencer.alt_email,
                        "interests":(userData.interests.length) ? userData.interests : craweldInfluencer.interests,
                        "language":(userData.language.length) ? userData.language : craweldInfluencer.language,
                        "address":(userData.address) ? userData.address : craweldInfluencer.address,
                        "dob":(userData.dob) ? userData.dob : craweldInfluencer.dob,
                        "country":(userData.country) ? userData.country : craweldInfluencer.country,
                        "state":(userData.state) ? userData.state : craweldInfluencer.state,
                        "city":(userData.city) ? userData.city : craweldInfluencer.city,
                        "isd_code":(userData.isd_code) ? userData.isd_code : craweldInfluencer.isd_code,
                        "alt_isd_code":(userData.alt_isd_code) ? userData.alt_isd_code : craweldInfluencer.alt_isd_code,
                        "isd_mobile":(userData.isd_mobile) ? userData.isd_mobile : craweldInfluencer.isd_mobile,
                        "isd_alt_mobile":(userData.isd_alt_mobile) ? userData.isd_alt_mobile : craweldInfluencer.isd_alt_mobile,
                        "gender":(userData.gender) ? userData.gender : craweldInfluencer.gender,
                        "is_verified":(userData.is_verified) ? userData.is_verified : craweldInfluencer.is_verified,
                        "profile_pic":(userData.profile_pic) ? userData.profile_pic : craweldInfluencer.profile_pic,
                        "note":(userData.note) ? userData.note : craweldInfluencer.note,
                        "status":(userData.status) ? userData.status : craweldInfluencer.status,
                        "registered":"1"
                    };
                    let myquery = { 
                        crawled_influencer_id: craweldInfluencer.crawled_influencer_id
                    };
                    
                    crawledInfluencerModel.update(myquery, updateData, async(errorUpdate, successUpdate)=>{
                        if(errorUpdate)
                            loggingImproved.error(handlerInfo, {ERROR: errorUpdate.message});
                        else{
                            let myqueryPlatfrom = { 
                                crawled_influencer_id: craweldInfluencer.crawled_influencer_id,
                                [platform_social]:name
                            };
                            let updatePlatfromData = {
                                    [`${platform}.$.id`]: (platformData[0].id) ? platformData[0].id : platfromCraledData.userId,
                                    [`${platform}.$.oauth_token`]: (platformData[0].oauth_token) ? platformData[0].oauth_token : "",
                                    [`${platform}.$.followers_count`]: (platformData[0].followers_count) ? platformData[0].followers_count :platfromCraledData.followerCount,
                                    [`${platform}.$.type`]: platformData[0].type,
                                    [`${platform}.$.category`]: (platformData[0].category) ? platformData[0].category:platfromCraledData.elv_category,
                                    [`${platform}.$.profile_image_url`]: (platformData[0].profile_image_url) ? platformData[0].profile_image_url :platfromCraledData.profilePicUrl,
                                    [`${platform}.$.first_name`]: (platformData[0].first_name) ? platformData[0].first_name :"",
                                    [`${platform}.$.last_name`]: (platformData[0].last_name) ? platformData[0].last_name : "",
                                    [`${platform}.$.name`]: (platformData[0].name) ? platformData[0].name : platfromCraledData.fullname ,
                                    [`${platform}.$.elv_social`]: platformData[0].Elv_social,
                                    [`${platform}.$.link`]: (platformData[0].link) ? platformData[0].link : platfromCraledData.link,
                                    [`${platform}.$.bio`]: (platformData[0].bio) ? platformData[0].bio : platfromCraledData.bio,
                                    [`${platform}.$.friends_count`]: (platformData[0].friends_count) ? platformData[0].friends_count : 0,
                                    [`${platform}.$.connection_type`]: "auto",
                                    [`${platform}.$.genres`]: (platformData[0].genres) ? platformData[0].genres : [],
                                    [`${platform}.$.cost_brand_video_upload`]: (platformData[0].cost_brand_video_upload) ? platformData[0].cost_brand_video_upload :"",
                                    [`${platform}.$.cost_video_post`]: (platformData[0].cost_video_post) ?platformData[0].cost_video_post:"",
                                    [`${platform}.$.cost_image_post`]: (platformData[0].cost_image_post) ? platformData[0].cost_image_post : ""
                            };
                           
                               let updatePlatfrom =  await crawledInfluencerModel.updateOne( myqueryPlatfrom , updatePlatfromData , { new: true });
                               //return responseHandle.sendResponsewithError(res, responseCode.INTERNAL_SERVER_ERROR, "errorUpdate",updatePlatfrom);
                        }

                    });    
                }
            }
        }
    }
};

/**
 * [influencer platform data API]
 * @param  {[type]} req [object received from the application.]
 * @param  {[type]} res [object to be sent as response from the api.]
 * @return {[type]}     [function call to return the appropriate response]
 */
const getPageList = async (req, res) => {
    let handlerInfo = {
        apiModule: "facebook",
        apiHandler: "getPageList"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";

    try {
         if(req.query.influencer_id){
                query = {
                    influencer_id : req.query.influencer_id
                }
                
                userService.findData(query,(error,success) => {
                    if(error){
                        responseMessage = "Something Went Wrong!";
                        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, 'Something went wrong', error);
                    }
                    else{
                        if(success)
                            return responseHandle.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'List fetch successfully',success);
                        else
                            return responseHandle.sendResponseWithData(res, responseCode.NOT_FOUND, 'List not found');
                    }
                });
           
        } else {
            return responseHandle.sendResponsewithError(
                handlerInfo,
                res, 
                responseCode.NOT_FOUND, 
                `key is missing.`
            );
        }
    } catch (err) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, err)
    }
};

/**
 * [influencer platform data API]
 * @param  {[type]} req [object received from the application.]
 * @param  {[type]} res [object to be sent as response from the api.]
 * @return {[type]}     [function call to return the appropriate response]
 */
const getPageData = async (req, res) => {
    let handlerInfo = {
        apiModule: "facebook",
        apiHandler: "getPageData"
    };

    loggingImproved.trace(handlerInfo, {REQUEST: req.body});
    let responseMessage = "";

  
            try {
        
                
                if(req.body.accessToken){
                    let fields = ['page_post_engagements','page_impressions','page_actions_post_reactions_like_total'];

                    let graphApiUrl = `https://graph.facebook.com/v2.8/${req.body.page_id}/insights?metric=` + fields.join(',');
                    let accessToken = req.body.accessToken;
                    const paramsData = {
                        access_token: accessToken
                    };
                    request.get({ url: graphApiUrl, qs: paramsData, json: true }, async (err, response, profile) =>{
                        if (response.statusCode !== 200) {
                            return responseHandle.sendResponsewithError(
                                handlerInfo,
                                res, 
                                responseCode.INTERNAL_SERVER_ERROR, 
                                'Page not found'
                            );
                        }
                   
                            return responseHandle.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'Page Info Fetch successfully',profile);
                       
                    
                });
           
        } else {
            return responseHandle.sendResponsewithError(
                handlerInfo,
                res, 
                responseCode.NOT_FOUND, 
                `key is missing.`
            );
        }
    } catch (err) {
        responseMessage = "Something Went Wrong!";
        return responseHandle.sendResponsewithError(handlerInfo, res, responseCode.INTERNAL_SERVER_ERROR, responseMessage, err)
    }
};

/*Export apis*/
module.exports = {
    facebookConnect,
    facebookCodeURI,
    facebookConnectMobile,
    getPageList,
    getPageData
};