/*
	Lambda Function for fileUploadHandler in crosscampus by xcampus API
	by Kazuma Sato 100948212 kazuma.sato@georgebrown.ca
    Date created: Feb 2, 2017
    Date last modified Feb 22, 2017
*/
'use strict';

const AWS = require('aws-sdk');

console.log('Loading fileUploadHandler');

// get reference to S3 client 
let s3 = new AWS.S3();


exports.fileUploadHandler = function(event, context, callback) {
	
	const async = require('async');
	const util = require('util');

	const file = JSON.parse(JSON.parse(event.key1).file);

	const mysql = require('mysql');
	const connection = mysql.createConnection(
        require('../xcampusdb')
    );

	// Insert statement to db
	let query = connection.query(
		'INSERT INTO file SET ?;',
		file,
		function (error, result) {

			if(error) throw error;
			console.log('Success! Entry added!');

			// Gets the ID for the new entry
			let query = connection.query(
				'LAST_INSERT_ID();',
				function(error,result) {

					file.id = row[0].id;
				}
			);
			console.log('Query : ' + query);
			console.log('ID for new entry : ' + entry.id);
		});


	console.log('Query : ' + query);
	connection.end();
	callback(null, JSON.stringify(entry);
	context.succeed();
};
console.logEnd();


// AWS EXAMPLE FOR S3 Upload Script
// I only put it here so I can review it later -Kaz
// http://docs.aws.amazon.com/lambda/latest/dg/with-s3.html

// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var gm = require('gm')
            .subClass({ imageMagick: true }); // Enable ImageMagick integration.
var util = require('util');


// get reference to S3 client 
var s3 = new AWS.S3();
 
exports.handler = function(event, context, callback) {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    =
    decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
    var dstBucket = srcBucket + "resized";
    var dstKey    = "resized-" + srcKey;

    // Sanity check: validate that source and destination are different buckets.
    if(srcBucket == dstBucket) {
        callback("Source and destination buckets are the same.");
        return;
    }

    // Infer the image type.
    var typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        callback("Could not determine the image type.");
        return;
    }
    var imageType = typeMatch[1];
    if (imageType != "jpg" && imageType != "png") {
        callback('Unsupported image type: ${imageType}');
        return;
    }

    // Download the image from S3, transform, and upload to a different S3 bucket.
    async.waterfall([
        function download(next) {
            // Download the image from S3 into a buffer.
            s3.getObject({
                    Bucket: srcBucket,
                    Key: srcKey
                },
                next);
            },
        function transform(response, next) {
            gm(response.Body).size(function(err, size) {
                // Infer the scaling factor to avoid stretching the image unnaturally.
                var scalingFactor = Math.min(
                    MAX_WIDTH / size.width,
                    MAX_HEIGHT / size.height
                );
                var width  = scalingFactor * size.width;
                var height = scalingFactor * size.height;

                // Transform the image buffer in memory.
                this.resize(width, height)
                    .toBuffer(imageType, function(err, buffer) {
                        if (err) {
                            next(err);
                        } else {
                            next(null, response.ContentType, buffer);
                        }
                    });
            });
        },
        function upload(contentType, data, next) {
            // Stream the transformed image to a different S3 bucket.
            s3.putObject({
                    Bucket: dstBucket,
                    Key: dstKey,
                    Body: data,
                    ContentType: contentType
                },
                next);
            }
        ], function (err) {
            if (err) {
                console.error(
                    'Unable to resize ' + srcBucket + '/' + srcKey +
                    ' and upload to ' + dstBucket + '/' + dstKey +
                    ' due to an error: ' + err
                );
            } else {
                console.log(
                    'Successfully resized ' + srcBucket + '/' + srcKey +
                    ' and uploaded to ' + dstBucket + '/' + dstKey
                );
            }

            callback(null, "message");
        }
    );
};