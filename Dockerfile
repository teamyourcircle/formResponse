
from node:12-alpine
workdir /app/src
copy / ./
expose 5000
env URI=mongodb+srv://kumarnitesh2000:Nitesh@2022@cluster0.8j6bd.mongodb.net/test?retryWrites=true
run ["npm","i"]
cmd ["node","index.js"]

