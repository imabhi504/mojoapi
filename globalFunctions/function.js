const request = require('request-promise');
//use user model
const user = require('../models/userModel.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_KEY);
const fs = require("fs");
var AWS = require('aws-sdk');
//AWS.config.loadFromPath('./s3_config.json');
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
var s3Bucket = new AWS.S3({ params: { Bucket: 'eleve-global' } });
var randomstring = require("randomstring");
const rankme_username = process.env.rankmeonline_username;
const rankme_password = process.env.rankmeonline_password;
const rankmeonline_base_url = process.env.rankmeonline_base_url
const headers = {'Authorization': 'Basic ' + new Buffer(rankme_username + ':' + rankme_password).toString('base64')};
var https = require('https');
const _ = require('lodash');
var mime = require('mime-types');
const path = require("path");
const FileType = require('file-type');
const ffmpeg = require('ffmpeg');
const axios = require("axios")
const MAX_WIDTH = 1440;
const MIN_WIDTH = 320;
const MAX_ASPECT_RATIO = 1.76
const MIN_ASPECT_RATIO = 0.8
const cheerio = require("cheerio");

const Genres = ["Fashion", "Lifestyle", "Travel", "Beauty", "Food & Beverages", "Parenting", "Sports", "Art", "Health & Fitness", "Automotive", "Geek/Gaming Business/Entrepreneurship", "Technology", "Entertainment", "Marketing", "DIY", "Nature", "Politics", "Finance", "Science", "Education", "Pets", "Culture", "Retail", "Photography", "Education", "Kids", "Jobs", "Dance", "Creators", "Celebrity"]
const Industries = ["Industry","Accounting","Airlines/Aviation","Alternative Dispute Resolution","Alternative Medicine","Animation","Apparel/Fashion","Architecture/Planning","Arts/Crafts","Automotive","Aviation/Aerospace","Banking/Mortgage","Biotechnology/Greentech","Broadcast Media","Building Materials","Business Supplies/Equipment","Capital Markets/Hedge Fund/Private Equity","Chemicals","Civic/Social Organization","Civil Engineering","Commercial Real Estate","Computer Games","Computer Hardware","Computer Networking","Computer Software/Engineering","Computer/Network Security","Construction","Consumer Electronics","Consumer Goods","Consumer Services","Cosmetics","Dairy","Defense/Space","Design","E-Learning","Education Management","Electrical/Electronic Manufacturing","Entertainment/Movie Production","Environmental Services","Events Services","Executive Office","Facilities Services","Farming","Financial Services","Fine Art","Fishery","Food Production","Food/Beverages","Fundraising","Furniture","Gambling/Casinos","Glass/Ceramics/Concrete","Government Administration","Government Relations","Graphic Design/Web Design","Health/Fitness","Higher Education/Acadamia","Hospital/Health Care","Hospitality","Human Resources/HR","Import/Export","Individual/Family Services","Industrial Automation","Information Services","Information Technology/IT","Insurance","International Affairs","International Trade/Development","Internet","Investment Banking/Venture","Investment Management/Hedge Fund/Private Equity","Judiciary","Law Enforcement","Law Practice/Law Firms","Legal Services","Legislative Office","Leisure/Travel","Library","Logistics/Procurement","Luxury Goods/Jewelry","Machinery","Management Consulting","Maritime","Market Research","Marketing/Advertising/Sales","Mechanical or Industrial Engineering","Media Production","Medical Equipment","Medical Practice","Mental Health Care","Military Industry","Mining/Metals","Motion Pictures/Film","Museums/Institutions","Music","Nanotechnology","Newspapers/Journalism","Non-Profit/Volunteering","Oil/Energy/Solar/Greentech","Online Publishing","Other Industry","Outsourcing/Offshoring","Package/Freight Delivery","Packaging/Containers","Paper/Forest Products","Performing Arts","Pharmaceuticals","Philanthropy","Photography","Plastics","Political Organization","Primary/Secondary Education","Printing","Professional Training","Program Development","Public Relations/PR","Public Safety","Publishing Industry","Railroad Manufacture","Ranching","Real Estate/Mortgage","Recreational Facilities/Services","Religious Institutions","Renewables/Environment","Research Industry","Restaurants","Retail Industry","Security/Investigations","Semiconductors","Shipbuilding","Sporting Goods","Sports","Staffing/Recruiting","Supermarkets","Telecommunications","Textiles","Think Tanks","Tobacco","Translation/Localization","Transportation","Utilities","Venture Capital/VC","Veterinary","Warehousing","Wholesale","Wine/Spirits","Wireless","Writing/Editing"]

const loggingImproved = require('../libs/loggingImproved')

function deleteKeysFromObject(object, keys) {
    var DOT_SEPARATOR = ".";
    var keysToDelete;
    var finalObject = _.cloneDeep(object);
    if (Array.isArray(keys)) {
        keysToDelete = keys;
    } else {
        keysToDelete = [keys];
    }
    keysToDelete.forEach(function (elem) {
        for (var prop in finalObject) {
            if (finalObject.hasOwnProperty(prop)) {
                if (elem === prop) {
                    // simple key to delete
                    delete finalObject[prop];
                } else if (elem.indexOf(DOT_SEPARATOR) != -1) {
                    var parts = elem.split(DOT_SEPARATOR);
                    var pathWithoutLastEl;

                    var lastAttribute;

                    if (parts && parts.length === 2) {

                        lastAttribute = parts[1];
                        pathWithoutLastEl = parts[0];
                        var nestedObjectRef = finalObject[pathWithoutLastEl];
                        if (nestedObjectRef) {
                            delete nestedObjectRef[lastAttribute];
                        }
                    } else if (parts && parts.length === 3) {
                        // last attribute is the last part of the parts
                        lastAttribute = parts[2];
                        var deepestRef = (finalObject[parts[0]])[parts[1]];
                        delete deepestRef[lastAttribute];
                    } else {
                        throw new Error("Nested level " + parts.length + " is not supported yet");
                    }

                } else {
                    if (_.isObject(finalObject[prop])) {
                        if (_.isArray(finalObject[prop])) {
                            finalObject[prop] = _.map(finalObject[prop], function (obj) {
                                return deleteKeysFromObject(obj, keysToDelete);
                            });
                        } else {
                            finalObject[prop] = deleteKeysFromObject(finalObject[prop], keysToDelete);
                        }
                    }
                }
            }

        }
    });

    return finalObject;


}
function getRootUploadsPath() {
    var dir = __dirname;
    dir = dir.split('/')
    dir.pop();
    dir = dir.join('/') + '/';
    return dir + 'services/';
}
module.exports = {
    deleteKeysFromObject,
    //Check post key validation
    listOfIndustries: () => {
        return Industries
    },
    listOfGenres: () => {
        return Genres
    },


    escapeElasticsearchQuery: (query) => {
        return query.replace(/(\+|\-|\=|&&|\|\||\>|\<|\!|\(|\)|\{|\}|\[|\]|\^|"|~|\*|\?|\:|\\|\/)/g, '\\$&');
    },
    
    checkRequest: (array, obj) => {
        for (i of array) {  
            if (obj[i] == undefined || obj[i] == "")
                return i;
        }
        return true;
    },

    getStateWithCities : (state) => {
        let Cities = {
            "Punjab" : ["Batala","Chandigarh","Amritsar","Barnala","Bathinda","Nabha","Faridkot","Fatehgarh Sahib","Fazilka","Firozpur","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Mansa","Moga","Nawanshahr","Pathankot","Patiala","Rupnagar","Mohali","Sangrur","Muktsar","Tarn Taran"],
            "Maharashtra"  : ["Ahmadnagar","Akola","Amravati","Aurangabad","Bhandara","Bhusawal","Bid","Buldana","Chandrapur","Daulatabad","Dhule","Jalgaon","Kalyan","Karli","Kolhapur","Mahabaleshwar","Malegaon","Matheran","Mumbai","Nagpur","Nanded","Nashik","Osmanabad","Pandharpur","Parbhani","Pune","Ratnagiri","Sangli","Satara","Sevagram","Solapur","Thane","Ulhasnagar","Vasai-Virar","Wardha","Yavatmal"],
            "Andaman And Nicobar Islands" : ["Port Blair"],
            "Andhra Pradesh" : ["Adoni", "Amaravati", "Anantapur", "Chandragiri", "Chittoor", "Dowlaiswaram", "Eluru", "Guntur", "Kadapa", "Kakinada", "Kurnool", "Machilipatnam", "Nagarjunakoṇḍa", "Rajahmundry", "Srikakulam", "Tirupati", "Vijayawada", "Visakhapatnam", "Vizianagaram", "Yemmiganur"],
            "Arunachal Pradesh": ["Itanagar"],
            "Assam" : ["Dhuburi","Dibrugarh","Dispur","Guwahati","Jorhat","Nagaon","Sibsagar","Silchar","Tezpur","Tinsukia"],
            "Bihar": ["Ara","Baruni","Begusarai","Bettiah","Bhagalpur","Bihar Sharif","Bodh Gaya","Buxar","Chapra","Darbhanga","Dehri","Dinapur Nizamat","Gaya","Hajipur","Jamalpur","Katihar","Madhubani","Motihari","Munger","Muzaffarpur","Patna","Purnia","Pusa","Saharsa","Samastipur","Sasaram","Sitamarhi","Siwan"],
            "Chandigarh": ["Chandigarh"],
            "Chhattisgarh": ["Ambikapur","Bhilai","Bilaspur","Dhamtari","Durg","Jagdalpur","Raipur","Rajnandgaon"],
            "Dadra And Nagar Haveli": ["Silvassa"],
            "Daman And Diu": ["Daman","Diu"],
            "Delhi": ["Delhi","New Delhi"],
            "New Delhi": ["Delhi","New Delhi"],
            "Goa": ["Madgaon","Panaji"],
            "Gujarat": ["Ahmadabad","Amreli","Bharuch","Bhavnagar","Bhuj","Dwarka","Gandhinagar","Godhra","Jamnagar","Junagadh","Kandla","Khambhat","Kheda","Mahesana","Morvi","Nadiad","Navsari","Okha","Palanpur","Patan","Porbandar","Rajkot","Surat","Surendranagar","Valsad","Veraval"],
            "Haryana": ["Ambala","Bhiwani","Chandigarh","Faridabad","Firozpur Jhirka","Gurgaon","Hansi","Hisar","Jind","Kaithal","Karnal","Kurukshetra","Panipat","Pehowa","Rewari","Rohtak","Sirsa","Sonipat"],
            "Himachal Pradesh": ["Bilaspur","Chamba","Dalhousie","Dharmshala","Hamirpur","Kangra","Kullu","Mandi","Nahan","Shimla","Una"],
            "Jammu And Kashmir": ["Anantnag","Baramula","Doda","Gulmarg","Jammu","Kathua","Leh","Punch","Rajauri","Srinagar","Udhampur"],
            "Jharkhand" : ["Bokaro","Chaibasa","Deoghar","Dhanbad","Dumka","Giridih","Hazaribag","Jamshedpur","Jharia","Rajmahal","Ranchi","Saraikela"],
            "Karnataka" : ["Badami","Ballari","Bangalore","Belgavi","Bhadravati","Bidar","Chikkamagaluru","Chitradurga","Davangere","Halebid","Hassan","Hubballi-Dharwad","Kalaburagi","Kolar","Madikeri","Mandya","Mangaluru","Mysuru","Raichur","Shivamogga","Shravanabelagola","Shrirangapattana","Tumkuru"],
            "Kerala": ["Alappuzha","Badagara","Idukki","Kannur","Kochi","Kollam","Kottayam","Kozhikode","Mattancheri","Palakkad","Thalassery","Thiruvananthapuram","Thrissur"],
            "Madhya Pradesh": ["Balaghat","Barwani","Betul","Bharhut","Bhind","Bhojpur","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Guna","Gwalior","Hoshangabad","Indore","Itarsi","Jabalpur","Jhabua","Khajuraho","Khandwa","Khargon","Maheshwar","Mandla","Mandsaur","Mhow","Morena","Murwara","Narsimhapur","Narsinghgarh","Narwar","Neemuch","Nowgong","Orchha","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Sarangpur","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Ujjain","Vidisha"],
            "Manipur" : ["Imphal"],
            "Meghalaya": ["Cherrapunji","Shillong"],
            "Mizoram" : ["Aizawl","Lunglei"],
            "Nagaland": ["Kohima","Mon","Phek","Wokha","Zunheboto"],
            "Odisha": ["Balangir","Baleshwar","Baripada","Bhubaneshwar","Brahmapur","Cuttack","Dhenkanal","Keonjhar","Konark","Koraput","Paradip","Phulabani","Puri","Sambalpur","Udayagiri"],
            "Puducherry": ["Karaikal","Mahe","Puducherry","Yanam"],
            "Rajasthan" : ["Abu","Ajmer","Alwar","Amer","Barmer","Beawar","Bharatpur","Bhilwara","Bikaner","Bundi","Chittaurgarh","Churu","Dhaulpur","Dungarpur","Ganganagar","Hanumangarh","Jaipur","Jaisalmer","Jalor","Jhalawar","Jhunjhunu","Jodhpur","Kishangarh","Kota","Merta","Nagaur","Nathdwara","Pali","Phalodi","Pushkar","Sawai Madhopur","Shahpura","Sikar","Sirohi","Tonk","Udaipur"],
            "Sikkim": ["Gangtok","Gyalsing","Lachung","Mangan"],
            "Tamil Nadu": ["Arcot","Chengalpattu","Chennai","Chidambaram","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kanchipuram","Kanniyakumari","Kodaikanal","Kumbakonam","Madurai","Mamallapuram","Nagappattinam","Nagercoil","Palayankottai","Pudukkottai","Rajapalaiyam","Ramanathapuram","Salem","Thanjavur","Tiruchchirappalli","Tirunelveli","Tiruppur","Tuticorin","Udhagamandalam","Vellore"],
            "Telangana":["Hyderabad","Karimnagar","Khammam","Mahbubnagar","Nizamabad","Sangareddi","Warangal"],
            "Tripura": ["Agartala"],
            "Uttar Pradesh": ["Agra","Aligarh","Amroha","Ayodhya","Azamgarh","Bahraich","Ballia","Banda","Bara Banki","Bareilly","Basti","Bijnor","Bithur","Budaun","Bulandshahr","Deoria","Etah","Etawah","Faizabad","Farrukhabad-cum-Fatehgarh","Fatehpur","Fatehpur Sikri","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur","Lakhimpur","Lalitpur","Lucknow","Mainpuri","Mathura","Meerut","Mirzapur-Vindhyachal","Moradabad","Muzaffarnagar","Partapgarh","Pilibhit","Prayagraj","Rae Bareli","Rampur","Saharanpur","Sambhal","Shahjahanpur","Sitapur","Sultanpur","Tehri","Varanasi"],
            "Uttarakhand":["Almora","Dehra Dun","Dehradun","Haridwar","Mussoorie","Nainital","Pithoragarh"],
            "West Bengal":["Alipore","Alipur Duar","Asansol","Baharampur","Bally","Balurghat","Bankura","Baranagar","Barasat","Barrackpore","Basirhat","Bhatpara","Bishnupur","Budge Budge","Burdwan","Chandernagore","Darjiling","Diamond Harbour","Dum Dum","Durgapur","Halisahar","Haora","Hugli","Ingraj Bazar","Jalpaiguri","Kalimpong","Kamarhati","Kanchrapara","Kharagpur","Koch Bihar","Kolkata","Krishnanagar","Malda","Midnapore","Murshidabad","Navadwip","Palashi","Panihati","Purulia","Raiganj","Santipur","Shantiniketan","Shrirampur","Siliguri","Siuri","Tamluk","Titagarh"]
        }
        if (!_.isNil(state) && !_.isEmpty(state)){
            state = state.toLowerCase()
            let keysOfCities = Object.keys(Cities)
            keysOfCities = keysOfCities.map(a => a.toLowerCase())
            let index = keysOfCities.findIndex(a => a.toLowerCase() == state)
            if (index > -1){
                let citiesOfState = Cities[keysOfCities[index].split(' ').map((b) =>  b.charAt(0).toUpperCase() + b.slice(1)).join(' ')]
                return citiesOfState
            }

        }
        return state
    },
    // check email from DB
    checkEmail: (obj) => {
        user.findOne({ email: obj }, (error, result) => {
            if (error) {
                return 0;
            } else {
                return result;
            }
        })
    },
    // check mobile from DB
    checkMobile: (obj) => {
        user.findOne({ mobile: obj }, (error, result) => {
            if (error) {
                return 0;
            } else {
                return result;
            }
        })
    },
    // sending email function
    sendEmail: (obj) => {
        var message = obj || {};
        var async = false;
        var ip_pool = "";
        var send_at = "";
        let email_format = "";
        // if(Object.keys(message).length){
        //     ({to:[{email:email_format,type}]} = message);
        //     let extention = email_format.split('@')[1];
        //     if(
        //         !extention.includes('eleve')
        //            &&
        //         !extention.includes('engagelyee')
        //            &&
        //         !extention.includes('gmail')
        //             &&
        //         !extention.includes('emcollab')
        //     ){
        //         message = {...message, to:[{email:'manish@eleve.co.in',type}]}
        //     }
        // }
        mandrill_client.messages.send({ "message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at }, function(result) {
            return result;
        }, function(e) {
            // Mandrill returns the error as an object with name and message keys
            return e.message;
        });
    },
    // Send SMS
    sendSMS: (obj) => {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "sendSMS"
        };

        let sns = new AWS.SNS({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });

         // just to handle the case
         if (!obj.message) {
            obj.message = `Use ${obj.otp} as your verification code on CreatorTag. The OTP expires within 10 mins.`
        }
        //obj.message = '[#] ' + obj.message + ' PCkRyd9EuxL - Team CreatorTag';
        obj.message = '[#] ' + obj.message + ' XlhLKyKONcb - Team CreatorTag';

        let params = {
            PhoneNumber: obj.mobile,
            //Message:'Use OTP '+ obj.otp +' to verify your mobile number on Eleve. OTP is valid for 10 minutes',
            Message: obj.message,
            //MessageStructure: 'string',
        };

        sns.publish(params, (err, data) => {
            if (err) {
                loggingImproved.error(handlerInfo, {ERROR: err.stack})
                throw err;
            }
        });
    },
    // sending OTP
    sendNewOTP: async(obj) => {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "sendNewOTP"
        };
        let key = 'Hj1CnqXrlq4ZIGSDdtqneepNvKcSgI';
        const options = {
            method: 'GET',
            uri: 'https://push.sanketik.net//api/push?accesskey=' + key + '&to=' + obj.mobile + '&text=' + 'Hi' + '&from=ELEVEM'
        };
        await request(options).then((response) => {
            // res.send(response.body);

        }).catch((err) => {
            loggingImproved.error(handlerInfo, {ERROR: err.stack})
        })
    },
    // uploading file to AWS
    uploadFile: async(userId, file, callback) => {
        let number = Math.random() * (999999 - 10000) + 10000
        let resData = {
            Key: userId + number,
            Body: file,
            // ContentEncoding: 'base64',
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        };
        await s3Bucket.upload(resData, (error, result) => {
            if (error) {
                return 0;
            } else {
                callback(null, result.Location);
            }
        });
    },

    // Upload pdf
    uploadPdfFiles: async(type, userId, file, name, callback) => {
        let number = Math.random() * (999999 - 10000) + 10000;
        //var contents = fs.readFileSync(file);
        fs.readFile(file, async function (err, image) {
        let resData = {
            Key: userId + number + name,
            Body: JSON.stringify(image, null, 2),
            'ContentType' : type,
            ACL: 'public-read'
        };
        await s3Bucket.upload(resData, (error, result) => {
            if (error) {
                return 0;
            } else {
                callback(null, result.Location);
            }
        });
    });
    },

    //generate Random String
    generateRandomString: () => {
        let newId = randomstring.generate({
            length: 12,
            charset: 'hex'
        });
        return newId = newId + new Date().getTime().toString();
    },
    //RankMeOnlineApi call for save user platform data
    savePlatformData: async (req_data) => {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "savePlatformData"
        };
        let api_url = rankmeonline_base_url + '/saveAuthTokenFormatted';
        const options = {
            method: 'POST',
            uri: api_url,
            json: req_data,
            headers: headers
        };
        await request(options).then((response) => {
                // if (response.body.responseCode == 200) {
                //     resolve(response.body);
                // } else {
                //     reject(response.body);
                // }
        })
        .catch(e => {
            loggingImproved.error(handlerInfo, {ERROR: e.stack})
        });
    },
    //RankMeOnlineApi call for save user platform data
    removePlatformData: async (req_data) => {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "removePlatformData"
        };
        let api_url = rankmeonline_base_url + '/invalidateSocialAuth';
        const options = {
            method: 'POST',
            uri: api_url,
            json: req_data,
            headers: headers
        };
        await request(options).then((response) => {
                // if (response.body.responseCode == 200) {
                //     resolve(response.body);
                // } else {
                //     reject(response.body);
                // }
        })
        .catch(e => {
            loggingImproved.error(handlerInfo, {ERROR: e.stack})
        });
    },

    commonCurlFuntion: async (req_data,end_point, callback) => {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "commonCurlFuntion"
        };
        let api_url = rankmeonline_base_url + '/'+end_point;
        const options = {
            method: 'POST',
            uri: api_url,
            json: req_data,
            headers: headers
        };
        await request(options).then((response) => {
            callback(null, response);
        })
        .catch(e => {
            loggingImproved.error(handlerInfo, {ERROR: e.stack})
            callback(null, e);
        });
    },
    // to send push notification
    sendNotification : (data) =>  {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "sendNotification"
        };
        var headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic " + process.env.APP_SECRET
        };

        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };
        var req = https.request(options, function(res) {
            res.on('data', function(data) {
            });
        });

        req.on('error', function(e) {
            loggingImproved.error(handlerInfo, {ERROR: e.stack})
        });

        req.write(JSON.stringify(data));
        req.end();
    },

    sendWebNotification : (data, receiver_type) =>  {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "sendWebNotification"
        };
        // receiver_type-> 1 admin, receiver_type-> 2 brand  
        if(receiver_type == 2){
            var headers = {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic " + process.env.WEB_BRAND_APP_SECRET
            }; 
        }else{
            var headers = {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic " + process.env.WEB_ADMIN_APP_SECRET
            }; 
        }

        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };
        var req = https.request(options, function (res) {
            res.on('data', function (data) {
            });
        });

        req.on('error', function (e) {
            loggingImproved.error(handlerInfo, {ERROR: e.stack})
        });

        req.write(JSON.stringify(data));
        req.end();
    },
     //trim input 
    trimRequestInput: (array, obj) => {
        for (i of array) {  
            obj[i] = _.isString(obj[i]) ? obj[i].trim() : obj[i];
            if (obj[i] == undefined || obj[i] == "")
                return i;
        }
        return true;
    },
    // downloadPicture: async(uri, fileName, callback)=>{
    //     try {
    //         request.get(uri, (err, res, body) => {
    //             if (res) {
    //                 let file = 'C:\\Users\\Manish\\Documents\\Eleve_projects\\user_services\\campaign_videos\\' + fileName + "." + mime.extension(res.headers['content-type']);
    //                 fileName = file;
    //                 var r = request(uri).pipe(fs.createWriteStream(file));
    //                 r.on('close', () => {
    //                     callback(fileName)
    //                 });
    //                 r.on('error', (err) => {
    //                     callback(null)
    //                 });
    //             } else {
    //                 callback(null)
    //             }
    //         });
    //     } catch (error) {
    //         return null
    //     }
    // },
    downloadPicture: async(uri, fileName, callback)=>{
        try {
            let response = null
            try {
                response = await request({ uri: uri, resolveWithFullResponse: true, rejectUnauthorized: false });
            } catch (error) {
                response = null
            }
            if (!_.isNil(response)) {
                let fileURL = getRootUploadsPath() + fileName + "." + mime.extension(response.headers['content-type']);
                var r = await request({ uri: uri, rejectUnauthorized: false }).pipe(fs.createWriteStream(fileURL));
                r.on('close', async () => {
                    callback(fileURL)
                });
                r.on('error', (err) => {
                    callback(null)
                });
            }else{
                callback(null)
            }
        } catch (error) {
            callback(null)
        }
    },

    getHashtags: (text, symbol = '#') => {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "getHashtags"
        };
        try {
            let hashtags = []
            if (!_.isNil(text)) {
                text = text.toString().split("\n").join(".")
                let sentences = text.split(".")
                for (let k = 0; k < sentences.length; k++) {
                    let linewords = sentences[k].split(" ")
                    for (let m = 0; m < linewords.length; m++) {
                        let word = linewords[m]
                        if (word.indexOf(symbol) >= 0 && word.length > 2) {
                            let hashIndex = word.indexOf(symbol)
                            word = word.substr(hashIndex)
                            if (word.indexOf(symbol) >= 0) {
                                let hashwords = word.split(symbol)
                                for (let n = 0; n < hashwords.length; n++) {
                                    let hash = hashwords[n]
                                    hash = hash.split(":")[0]
                                    hash = hash.split(",")[0]
                                    if (hash.length > 2) {
                                        hashtags.push(hash.toLowerCase())
                                    }
                                }
                            }
                            else {
                                hashtags.push(word.substr(1).toLowerCase())
                            }
                        }
                    }
                }
            }
            return hashtags
        } catch (err) {
            loggingImproved.error(handlerInfo, {ERROR: err.stack})
        }
    },

    getEngagementData: (authorType, postData) => {
        let response = {
            likeCount: 0,
            shareCount: 0,
            commentCount: 0,
            videoViewCount: 0,
        }
        if (authorType && postData) {
            if (authorType == "INSTAGRAM") {
                response.likeCount = !_.isNil(postData.likes_count) ? postData.likes_count : 0;
                response.commentCount = !_.isNil(postData.comment_count) ? postData.comment_count : 0;
                response.videoViewCount = !_.isNil(postData.video_views_count) ? postData.video_views_count : 0
            } else if (authorType == "FACEBOOK") {
                response.likeCount = !_.isNil(postData.likes_count) ? postData.likes_count : 0;
                response.shareCount = !_.isNil(postData.shares_count) ? postData.shares_count : 0
                response.commentCount = !_.isNil(postData.comment_count) ? postData.comment_count : 0
            } else if (authorType == "TWITTER") {
                response.likeCount = !_.isNil(postData.likes_count) ? postData.likes_count : 0
                response.shareCount = !_.isNil(postData.shares_count) ? postData.shares_count : 0
            }
        }
        return response
    },

    uploadToS3: (fileName, callback) => {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "uploadToS3"
        };
        try {
            var contents = fs.readFileSync(fileName);
            let fileNameToUpload =  path.basename(fileName)
            let resData = {
                Key: fileNameToUpload,
                Body: contents,
                ContentType: mime.contentType(fileName),
                ACL: 'public-read'
            };
            s3Bucket.upload(resData, function (err, data) {
                if (err) {
                    loggingImproved.error(handlerInfo, {ERROR: err.stack})
                    callback(null);
                } else {
                    try {
                        fs.unlinkSync(fileName);
                    } catch (removerr) {
                    }
                    callback(data);
                }
            })
        } catch (uploads3err) {
            callback(null)
        }
    },
    deleteFromS3:(fileName, callback)=>{
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "deleteFromS3"
        };
        let resData = {
            Key: fileName
        };
        s3Bucket.deleteObject(resData, function(err,data){
            if(err){
                loggingImproved.error(handlerInfo, {ERROR: err.stack})
                callback(null)
            }else {
                callback("Delete successfull")
            }
        })
    },
    extractDomainName: (url) => {
        if (!url) return url;
        let hostname = "";
        if (url.indexOf("://") > -1) {
            hostname = url.split("/")[2];
        } else {
            hostname = url.split("/")[0];
        }
        hostname = hostname.split(":")[0];
        hostname = hostname.split("?")[0];
        url = hostname.toLowerCase()
        if (url.startsWith("www.")) {
            url = url.slice(4);
        }
        return url.toLowerCase();
    },
    isImageURL: async (url, filename) => {
        try {
            let response = null
            try {
                response = await request({ uri: url, resolveWithFullResponse: true });
            } catch (error) {
                response = null
            }
            if (!_.isNil(response)) {
                let fileURL = getRootUploadsPath() + filename + "." + mime.extension(response.headers['content-type']);
                var r = await request(url).pipe(fs.createWriteStream(fileURL));
                return new Promise((resolve, reject) => {
                    r.on('close', async () => {
                        let fileType = await FileType.fromFile(fileURL);
                        try {
                            fs.unlinkSync(fileURL);
                        } catch (removerr) {
                        }
                        if (fileType)
                            if (fileType.mime.startsWith("image/"))
                                resolve(true)
                            else
                                resolve(false)
                        else {
                            resolve(false)
                        }
                    });
                    r.on('error', (err) => {
                        try {
                            fs.unlinkSync(fileURL);
                        } catch (removerr) {
                        }
                        resolve(false)
                    });
                })
            } else {
                return false
            }
        } catch (err) {
            return new Promise((resolve, reject) => {
                resolve(false)
            })
            
        }

    },
    errorResponse : (error) => {
        let errorObject = {};
        if(error.responseCode){
             errorObject.responseCode = error.responseCode;
        }
        if(error.statusCode){
             errorObject.statusCode = error.statusCode;
        }
        if(error.responseMessage){
            errorObject.responseMessage = error.responseMessage;
       }
       if(error.error && error.error.message){
            errorObject.responseMessage = error.error.message;
       }
       errorObject.result = {};
        return errorObject;
    },
    // user Update Date
    userUpdateDate: async (email, type) => {
        let updateData;
        if(type == 1)
            updateData = { $set: { 'updates.basic_detail_date':new Date() } };
        else
            updateData = { $set: { 'updates.platform_detail_date':new Date() } };
       await user.findOneAndUpdate({email:email},updateData,{});
    },
   
    //Video convertor
    getResizeVideo : async (file) => {
        let handlerInfo = {
            apiModule: "globalFunctions",
            apiHandler: "getResizeVideo"
        };
        try {
            try {
                var process = new ffmpeg('whatsapp_test.mp4');
                process.then(function (video) {
                    // Video metadata
                    // FFmpeg configuration
                    let width = video.metadata.video.resolution.w;
                    let height = video.metadata.video.resolution.h;
                    if ((video.metadata.video.rotate / 90) % 2 == 1) {
                        let tmp = width;
                        width = height;
                        height = tmp;
                    }
    
                    let currentRatio = width / height;
                    let desiredRatio = currentRatio;

                    if (width > MAX_WIDTH) {
                        width = MAX_WIDTH
                    }
            
                    if (currentRatio > MAX_ASPECT_RATIO) {
                        desiredRatio = MAX_ASPECT_RATIO;
                    } else if (currentRatio < MIN_ASPECT_RATIO) {
                        desiredRatio = MIN_ASPECT_RATIO;
                    }
            
                    height = width / desiredRatio
                    // more parameters from here
                    // https://www.npmjs.com/package/ffmpeg 
                    video
                    .setVideoDuration(60)
                    .setVideoFormat("mp4")
                    .setVideoAspectRatio(desiredRatio)
                    .setVideoSize(`${width}x${height}`,"true","true", "#000")
                    .save("whatsapp_saved_video.mp4", function (error, file) {
                        if (!error) {
                            return res.send({ status: "success", data: video.metadata })
                        } else {
                            loggingImproved.error(handlerInfo, {ERROR: error.stack})
                            return res.send({ status: "fail", error: error })
                        }
                    })
                }, function (err) {
                    loggingImproved.error(handlerInfo, {ERROR: err.stack})
                });
            } catch (e) {
                loggingImproved.error(handlerInfo, {ERROR: e.stack})
            }
        } catch (e) {
            loggingImproved.error(handlerInfo, {ERROR: e.stack})
            return res.send({status:"fail"})
        }
    },
    getYoutubeChannelIdData: async (channelID, parts) => {
        let randomNumber = Math.floor(Math.random() * 3) + 1;
        let YOUTUBE_KEY = process.env['GOOGLE_CLOUD_YOUTUBE_KEYV' + randomNumber]
        let youtubeUrl = `https://www.googleapis.com/youtube/v3/channels?part=${parts}&id=${channelID}&key=${YOUTUBE_KEY}`;
        let response = null;
        let requestOptions = {
            url: youtubeUrl,
            method: 'GET'
        }
        try {
            response = await axios(requestOptions)
        } catch (err) {return null }
        if (response.status && response.status == 200) {
            return response.data;
        }else{
            return null
        }

    },
    fetchYoutubeIdByUsername: async (profile_url, username) => {
        let youtube_channel_id = ""
        if (!_.isNil(profile_url) && !_.isEmpty(profile_url)) {
            if (profile_url.slice(-1) == "/")
                profile_url = profile_url.slice(0, -1)
            let about_url = profile_url + "/about"

            let cookies = {
                "authority": "www.youtube.com",
                "cache-control": "no-cache",
                "upgrade-insecure-requests": "1",
                "user-agent": " Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.61 Safari/537.36",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-GB,en;q=0.9"
            }

            let requestOptions = {
                method: 'GET',
                url: about_url,
                headers: cookies
            }
            let html = null;
            try {
                html = await axios(requestOptions)
            } catch (err) { }
            if (html && html.status == 200 && html.data) {
                let $ = cheerio.load(html.data, {
                    normalizeWhitespace: false,
                    xmlMode: false,
                    decodeEntities: true
                })
                let scriptsLength = $("script").length;
                let pos = -1;

                for (let i = 0; i < scriptsLength; i++) {
                    if (!_.isNil($("script")[i]) && !_.isNil($("script")[i].childNodes)
                        && !_.isNil($("script")[i].childNodes[0]) && !_.isNil($("script")[i].childNodes[0].data)
                        && $("script")[i].childNodes[0].data.indexOf("var ytInitialData") > -1) {
                        pos = i;
                        break;
                    }
                }

                if (pos > -1) {
                    let javascriptStr = $("script")[pos].childNodes[0].data.substr(20);
                    if (javascriptStr.slice(-1) == ";") {
                        javascriptStr = javascriptStr.slice(0, -1)
                    }
                    let ytData = JSON.parse(javascriptStr);
                    if (ytData && ytData.header && ytData.header.c4TabbedHeaderRenderer
                        && ytData.header.c4TabbedHeaderRenderer.channelId) {
                        youtube_channel_id = ytData.header.c4TabbedHeaderRenderer.channelId
                    }
                }
            }

        }
        if (!_.isNil(username) && !_.isEmpty(username) && (_.isNil(youtube_channel_id) || _.isEmpty(youtube_channel_id))) {
            let randomNumber = Math.floor(Math.random() * 7) + 1;
            let YOUTUBE_KEY = process.env['GOOGLE_CLOUD_YOUTUBE_KEYV' + randomNumber]
            let parts = "id"
            let youtubeUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=${parts}&forUsername=${username}&key=${YOUTUBE_KEY}&maxResults=1`;
            let requestOptions = {
                url: youtubeUrl,
                method: 'GET'
            };
            let response = null;
            try {
                response = await axios(requestOptions)
            } catch (err) { }
            if (response && response.status && response.status == 200) {
                let youtubeApiData = response.data.items;
                if (youtubeApiData && youtubeApiData.length > 0) {
                    youtube_channel_id = youtubeApiData[0].id;
                }
            }
            if (_.isNil(youtube_channel_id) || _.isEmpty(youtube_channel_id)) {
                let requestOptions = {
                    url: `https://yt.lemnoslife.com/channels?part=snippet&forUsername=${username}`,
                    method: 'GET'
                };
                let response = null;
                try {
                    response = await axios(requestOptions)
                } catch (err) { }
                if (response && response.status && response.status == 200) {
                    let youtubeApiData = response.data.items;
                    if (youtubeApiData && youtubeApiData.length > 0) {
                        youtube_channel_id = youtubeApiData[0].id;
                    }
                }
            }


        }
        return youtube_channel_id
    },
    // Get By Pass Otp 
    getByPassOtp: (obj) => {
        let otp = null;
        if(obj.email && obj.email.endsWith('testapp.com')){
            otp = 1234;
        }
        return otp;
    },

    customJoiErrorMessage: (validationResponse) => {
        const handlerInfo = {
          apiModule: "globalFunctions",
          apiHandler: "customJoiErrorMessage",
        };
        let errorMessage = "";
      
        loggingImproved.trace(handlerInfo, {
          VALIDATION_RESPONSE: validationResponse,
        });
      
        validationResponse.error.details.forEach((err) => {
          switch (err.type) {
            case "any.required":
              errorMessage = `${err.context.key} is required!`;
              break;
            case "any.empty":
              errorMessage = `${err.context.key} should not be empty!`;
              break;
            case "string.trim":
              errorMessage = `${err.context.key} must not have leading or trailing whitespace`;
              break;
            case "string.empty":
              errorMessage = `${err.context.key} is not allowed to be empty`;
              break;
            case "number.base":
              errorMessage = `${err.context.key} must be a number`;
              break;
            case "string.base":
              errorMessage = `${err.context.key} must be a string`;
              break;
            case "number.min":
              errorMessage = `${err.context.key} must be greater`
              break;
            case "string.pattern.base":
                errorMessage = `${err.context.key} must be valid value`
                break;  
            default:
              errorMessage = "Invalid Parameters";
              break;
          }
        });
      
        return errorMessage;
      }

}