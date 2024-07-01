#!/bin/sh
  
image="registry.eleveglobal.com/user_service"  
  
#get timestamp for the tag  
timestamp=$(date +"v%d.%m.%y")  

#get hash tag of git
hashtag=$(git log -1 --pretty=%h)
  
tag=$image:$hashtag.$timestamp

#build image  
sudo docker build -t $tag .  

#sudo docker login -u username -p password
docker login -u eleve -p eleve@321 registry.eleveglobal.com

#push to private registry
sudo docker push $image  
  
#remove dangling images  
sudo docker system prune -f  
