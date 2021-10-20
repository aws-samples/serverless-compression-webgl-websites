# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
import boto3
import tempfile
import gzip
from pathlib import Path

s3_client = boto3.client("s3")

def lambda_handler(event, context):

    # Get the object from the event
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = event["Records"][0]["s3"]["object"]["key"]

    fname = Path(key).name
    # Construct new desintation path for compressed file
    newPath = Path("model")
    newKey = Path.joinpath(newPath, fname)

    # Create temporary files to read/write on Lambda filesystem
    tmp = tempfile.NamedTemporaryFile(delete=True)
    tmpgzip = tempfile.NamedTemporaryFile(delete=True)

    # Download uncompressed file from S3 bucket to Lambda temp filesystem
    try:
        s3_client.download_file(bucket, key, tmp.name)
        print(f"{key} downloaded to Lambda {tmp.name}")
    except:
        print("error downloading S3 file, check Lambda permissions")
        raise

    # Compress file
    try:
        blob_data = Path(tmp.name).read_bytes()
        with gzip.GzipFile(tmpgzip.name, "wb") as output:
            output.write(blob_data)
    except:
        print("error compressing file")
        raise

    # Upload compressed file with new location in bucket and add content encoding tag
    else:
        s3_client.upload_file(
            tmpgzip.name, bucket, str(newKey), ExtraArgs={"ContentEncoding": "gzip"}
        )

    # Cleanp temp storage and delete original uncompressed file from S3
    finally:
        tmp.close()  # deletes temp file
        tmpgzip.close()  # deletes temp gzip file
        s3_client.delete_object(Bucket=bucket, Key=key)
        print("Done")
