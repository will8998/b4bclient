# band4band-website

Assuming a fresh VPS (in this case Ubuntu 24.04):

```bash
# I. Setup
sudo apt update
sudo apt install -y curl git certbot
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm i 23.8.0
nvm use 23.8.0

npm i -g pm2
npm i

code --install-extension svelte.svelte-vscode

sudo certbot certonly --standalone

git init

# II. Developing (Port 3000)
npm run dev

# III. Pushing to production (Port 80/443)
npm run build
pm2 start "npm run prod" --name prod
```
# b4bclient
