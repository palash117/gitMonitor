cd ~/dev/gitMonitor
echo "MOVING TO FILESERVER CODE DIRECTORY\n"

git pull
echo "PULLING LATEST CODE CHANGES\n"

docker kill gitMon
docker container rm gitMon
echo "KILLING LAST KNOWN FILESERVER CONTAINER\n"

docker rmi gitMon
docker build . | tee  /tmp/dockerbuildGitMon.txt
echo "BUILDING LATEST DOCKER IMAGE"

temp=$(tail -1 /tmp/dockerbuildGitMon.txt)
IFS=' '
read -ra ADDR <<< "$temp"
for i in "${ADDR[@]}"; do
	dockerImageId="$i"
done
echo "$dockerImageId"

echo "RUNNING DOCKER IMAGE IN HEADLESS MODE"

docker -d run --name gitmon5 -v ~/keyConfig/gitMonConfig:/usr/src/app/config -v ~/keyConfig/gitMonStorage:/usr/src/app/storage ${dockerImageId}
