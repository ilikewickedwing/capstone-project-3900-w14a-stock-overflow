# Install node js
sudo apt update
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
sudo curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
# Install yarn
sudo curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update
sudo apt-get install yarn
# Install yarn dependencies
cd /backend
yarn install
cd ../frontend
yarn install