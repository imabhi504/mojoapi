const levels = {
    trace : 0,
    debug : 1,
    info  : 2,
    warn  : 3,
    error : 4
};

const debuggingPermissions = {

    loggingEnabled      : true,
    defaultLoggingLevel : levels.trace,

    serverInit : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        listening           : true,
        uncaughtException   : true,
        unhandledRejection  : true
    },

    redis : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        db_connected        : true
    },

    mongodbHandler : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        db_connected            : true,
        db_error                : true,
        db_disconnected         : true,
        db_close                : true
    },

    middleware : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        checkToken          : false,
        checkAdminUser      : false,
        checkUser           : false,
        checkDiscoveryToken : false,
    },

    cronServices : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        schedulePostToPublishApi    : false,
        cron_service                : false,
    },

    activityLogsController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        createActivityLog       : false,
        authenticateActivity    : false,
        setActivityResponse     : false,
        saveLoginInfo           : false,
    },

    adminController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        usersList_old       : false,
        usersList           : false,
        adminLogin          : false,
        createAdmin         : false,
        updateStatus        : false,
        adminUpdate         : false,
        adminPasswordUpdate : false,
        getUserData         : false,
        adminUserImageUpload    : false,
        adminChangePassword     : false,
        adminList               : false,
        hashAdminPassword       : false,
        superAdmin              : false,
        adminResetPassword      : false,
        userTokenUpdate         : false,
        getAdminEmails          : false,
    },

    advertiser : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        searchOrganisation  : false,
    },

    advertiserController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        advertiserList                  : false,
        advertiserData                  : false,
        createAdvertiser_old            : false,
        createAdvertiser                : false,
        advertiserImageUpload           : false,
        editAdvertiser                  : false,
        statusUpdate                    : false,
        hashAdverPassword               : false,
        campaignBoardAdvertiser         : false,
        updateBrandDiscoverPermission   : false,
        searchOrganisation              : false,
    },

    analyticsController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        generateAnalyticsInfluencerPdf  : false,
        influencerScore                 : false,
        similarInfluencer               : false,
        suggestTopHashtag               : false,
        changeImageToS3                 : false,
    },
    
    bankController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        getBankAccounts     : false,
        addBankAccount      : false,
        editBankAccount     : false,
        deleteBankAccount   : false,
        defaultBankAccount  : false,
        getAccountByUserId  : false,
        validateIfscCode    : false,
    },
    
    changePasswordController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
      
        checkcurrentpassword    : false,
        changePassword          : false,

    },
    
    crawlInfluencerController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        saveInfluencerProfileData   : false,
        saveFormatInfluencerData    : false,
        saveAuthInfluencerData      : false,
        saveAudienceDemographic     : false,
        saveBrandListImage          : false,
        savePostData                : false,
        addInfluencerOrganisation   : false,
        removeInfluencerOrganisation    : false,
        getOrganisationInfluencersList  : false,
        getInfluencerOrganisations      : false,

    },
    
    currencyValueConverter : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        getCurrencyValue    : false,
    },

    discoverController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        discover_influencer : false,
        getListOfLocations  : false,
        getListOfLanguages  : false,
        getListOfGenres     : false,
        addInfluencer       : false,
        addInfluencerAccount    : false,
        getInfluencerInsights   : false,
        getAboutPresense        : false,
        getAboutGenre           : false,
        getAboutEngagement      : false,
        getAboutLocations       : false,
        getAboutTopContent      : false,
        getAboutFollowerGrowth  : false,
        profileContentPosts     : false,
        getMediaType            : false,
        getWordCloud            : false,
        getHashtagCloud         : false,
        updateProfileData       : false,
        addInfluencersToBoard   : false,
        profileAudience         : false,
        getContentBrandAffinity : false,
        checkUpdateStatus       : false,
        getInfoProfile          : false,
        postInfoProfile         : false,
        getInfoCommercials      : false,
        postInfoCommercials     : false,
        getLatestActivities     : false,
        changeAccountType       : false,
        changeCelebrityType     : false,
        listOfIndustries        : false,
        listOfGenres            : false,
    },
    
    emailVerificationController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        checkemail          : false,
        email_send_link     : false,
        email_verify        : false,
        forgotPasswordSendLinkWeb   : false,
        forgotPasswordVerifyLinkWeb : false,
        resetPasswordVerifyWeb      : false,
        userskills                  : false,
        mobileVerificationSend      : false,
        verifyMobileOTP             : false,
        checkemailInfo              : false,
        forgotPasswordMobile        : false,
        verifyForgotPasswordMobile  : false,
        emailVerificationMobile     : false,
        emailVerifyMobile           : false,
        userMobileVerificationSend  : false,
        userVerifyMobileOTP         : false,
    },
    
    excelUploadController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
      
        uploadExcel         : false,
        influecnerUploadExcel_old   : false,
        influecnerUploadExcel       : false,
    },
    
    explorerArticleController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        category_list       : false,
        article_list        : false,
        create_article      : false,
        delete_article      : false,
        create_category     : false,
    },
    
    facebook : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        facebookConnect     : false,
        facebookCodeURI     : false,
        facebookConnectMobile   : false,
    },
    
    hubController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        hub_list            : false,
    },
    
    influencerCampaignController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        getInfluencerCampaignList   : false,
        campaignDetail              : false,
        getCampaignCompletedList    : false,
        actionInfluencerCampaign_old    : false,
        actionInfluencerCampaign        : false,
        campaignTwitterPost_old         : false,
        campaignTwitterPost             : false,
        checkUserAuthentication         : false,
        campaignReweetUpdate            : false,
        retweetCountUpdate              : false,
    },
    
    influencerController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        createInfluencer    : false,
        checkEmailExist     : false,
        editDetailInfluencer    : false,
        getInfluencerDetail     : false,
        statusUpdate            : false,
        getInfluencerList       : false,
        getYoutueChannelInfo    : false,
        getMaxReachCountData    : false,
        editSocialDetailInfluencer  : false,
        deleteSocialCard            : false,
        genreList                   : false,
        checkHandleUrl              : false,
        getInfluencerListDataForExcel   : false,
        getAllPlatforms                 : false,

    },
    
    influencerProjectController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        influencer_project  : false,
        project_detail      : false,
        deleteProjectPost   : false,
        updateStatus        : false,
        projectListing      : false,
        taskListing         : false,
        invoiceListing      : false,
        taskDetail          : false,
        deleteProject       : false,
        projectInvice       : false,
    },
    
    instagramBusinessController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        instagramBusinessConnect    : false,
        instagramBusinessConnectMobile  : false,
        instagramBusinessCodeURI        : false,
    },
    
    instagramController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        authorize_user      : false,
        handleauth          : false,
        handleauth_mobile   : false,
        authorize_user_bak  : false,
        handleauth_bak      : false,
        loginInstagram      : false,
        loginInstagramCallback  : false,
    },
    
    linkedinController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        linkiedInLogin_old  : false,
        linkedinLogin       : false,
        linkedInCheck       : false,
    },
    
    logsController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        getSingularexStats  : false,
    },
    
    messageController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        send_new_message                        : false,
        get_message                             : false,
        change_message_status                   : false,
        change_message_status_board_influencer  : false,
        change_message_acknowledge              : false,
        get_unread_message_count                : false,
        get_unread_message_count_board_influencer   : false,
    },
    
    notificationController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        settings            : false,
        getNotification     : false,
        getNotification1    : false,
        updateNotification  : false,
        unreadNotification  : false,
        unreadNotification1 : false,
        resetNotificationCount  : false,
    },
    
    organisationController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
      
        organisationList                    : false,
        postOrganisationdata                : false,
        updateOrganisationAddresses         : false,
        updateOrganisation                  : false,
        details                             : false,
        getOrganisationdata                 : false,
        campaignBoardOrganisation           : false,
        updateOrganizationPermissions_old   : false,
        updateOrganizationPermissions       : false,
        getOrganizationPermissions          : false,
        permissionOrganizationList          : false,
        getOrganisationList                 : false,
        associateInfluencerWithAgencyExcel  : false,
        getAgencyWithInfluencerSampleSheet  : false,
    },
    
    paymentController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        paymentAdd          : false,
        getGstData          : false,
        countryList         : false,
        stateList           : false,
        cityList            : false,
        countryISD          : false,
        currencyList        : false,
        addPaymentPostData  : false,
        addPaymentPost      : false,
        addPaymentPost_old  : false,
        paymentDetailVerification   : false,
    },
    
    postController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        postList            : false,
        publishPost         : false,
        deletePost          : false,
        updatePost          : false,
    },
    
    profileController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        userData            : false,
        userDataUpdate      : false,
        phoneCheck          : false,
        sendOTP             : false,
        verifyOTP           : false,
        userImageUpload     : false,
        skillSettings       : false,
        updateTermCondition : false,
    },
    
    resetController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        resetPassword       : false,
        forgotPassword      : false,
        checkTokenValidity  : false,
    },
    
    socialController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        authorize_user      : false,
        handleauth          : false,
        addConnection       : false,
        deleteConnection    : false,
        deleteSocials       : false,
        addBlog_old         : false,
        addBlog             : false,
        deleteBlog          : false,
    },
    
    twitterController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        twitterConnection       : false,
        getData                 : false,
        twitterConnectionMobile : false,
    },
    
    userController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        login                       : false,
        verifyToLogin               : false,
        logout                      : false,
        postUserdata                : false,
        postSubscribeData           : false,
        saveDeviceInfo              : false,
        rateCardCheck               : false,
        createRateCard              : false,
        getSocialProfiles           : false,
        removeRateCard              : false,
        rateCardList                : false,
        hashInfluencerPassword      : false,
        eleveOldData                : false,
        deleteUserInfluencer        : false,
        eleveOldAdvertiserData      : false,
        eleveOldOrganizationData    : false,
        eleveOldAdminData           : false,
        eleveOldDataIndo            : false,
        googleSignIn                : false,
        facebookSignIn              : false,
        removeUser                  : false,
    },
    
    youtubeController : {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,
        
        youtubeLogin                    : false,
        YoutubeCallBack                 : false,
        saveGoogleConnectedYoutubeData  : false,
        fetchBasicYoutubeData           : false,
    },

    globalFunctions: {
        loggingEnabled      : true,
        defaultLoggingLevel : levels.trace,

        sendSMS             : false,
        sendNewOTP          : false,
        savePlatformData    : false,
        removePlatformData  : false,
        commonCurlFuntion   : false,
        sendNotification    : false,
        sendWebNotification : false,
        getHashtags         : false,
        uploadToS3          : false,
        deleteFromS3        : false,
        getResizeVideo      : false,
        

    }
    
};

function log(loggingLevel, loggingParameters){
    var handlingInfo = loggingParameters[0];
    var apiModule    = handlingInfo.apiModule;
    var apiHandler   = handlingInfo.apiHandler;

    var defaultLoggingLevel = debuggingPermissions[apiModule].defaultLoggingLevel;

    if (loggingLevel !== levels.error && (!isLoggingEnabled(apiModule, apiHandler) || loggingLevel > defaultLoggingLevel)) {
        return;
    }

    var stream = process.stdout;
    if(loggingLevel === levels.error){
        stream = process.stderr;
    }

    for(var i = 1; i < loggingParameters.length; i++){
        if(typeof loggingParameters[i] == 'string') {
            loggingParameters[i] = loggingParameters[i].split('\n').join(' ');
        }

        stream.write(apiModule + ' ::: ' + apiHandler + ' ::: ' + JSON.stringify(loggingParameters[i]) + '\n');
    }
}

function trace(){
    log(levels.trace, arguments);
}

function debug(){
    log(levels.debug, arguments);
}

function info(){
    log(levels.info, arguments);
}

function warn(){
    log(levels.warn, arguments);
}

function error(){
    log(levels.error, arguments);
}

function isLoggingEnabled(module, handler){
    // Check if the logging has been enabled
    if(!debuggingPermissions.loggingEnabled){
        return false;
    }

    // Check if the logging has been enabled for the complete module
    if (!debuggingPermissions[module].loggingEnabled){
        return false;
    }

    // Check if the logging has been enabled for the particular handler function for the module
    if (!debuggingPermissions[module][handler]){
        return false;
    }

    return true;
}

exports.trace               = trace;
exports.debug               = debug;
exports.info                = info;
exports.warn                = warn;
exports.error               = error;