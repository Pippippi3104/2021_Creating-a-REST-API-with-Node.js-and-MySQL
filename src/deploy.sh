GOOGLE_PROJECT_ID=bark-bark-api-317105
CLOUD_RUN_SERVICE=bark-bark-api-317105-service
DB_USER=root
DB_PASS=111111111!Qq
DB_NAME=dog_data
INSTANCE_CONNECTOIN_NAME=bark-bark-api-317105:us-central1:barkbark

gcloud builds submit --tag gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \
  --project=$GOOGLE_PROJECT_ID

# gcloud run deploy $CLOUD_RUN_SERVICE \
#   --image gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \
#   --add-cloudsql-instances $INSTANCE_CONNECTOIN_NAME \
#   --update-env-vars INSTANCE_CONNECTOIN_NAME=$INSTANCE_CONNECTOIN_NAME,DB_PASS=$DB_PASS,DB_USER=$DB_USER,DB_NAME=$DB_NAME \
#   --platform managed \
#   --region us-central1 \
#   --allow-unauthenticated \
#   --project=$GOOGLE_PROJECT_ID