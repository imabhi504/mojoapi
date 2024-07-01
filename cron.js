const cron = require('node-cron');
const postCron = require('./cronServices/schedule_post_cron');
const invoiceCron = require('./cronServices/invoice_cron');
const hubCron = require('./cronServices/hub_post');
const platformCron = require('./cronServices/update_influencer_platform');
const loggingImproved = require('./libs/loggingImproved');

//Call post related Crons every one minute
cron_service = () =>{
    let handlerInfo = {
        apiModule: "cronServices",
        apiHandler: "cron_service"
    };

    let intervalTime = "* * * * *";
    cron.schedule(intervalTime, () => {
        postCron.schedulePostToPublish(handlerInfo);
    });
    cron.schedule("0 0 */23 * *", () => {
        //invoiceCron.generateInvoice(handlerInfo);
    });
    cron.schedule(intervalTime, () => {
       // hubCron.userPostFetch();
    });
    cron.schedule('0 0 */3 * *', () => {
       platformCron.updateDiscoverToInfluencerPlatforms(handlerInfo);
    });
    
}

//call function
cron_service();