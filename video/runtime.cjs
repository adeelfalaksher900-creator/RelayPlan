const os = require('node:os');
const networkInterfaces = os.networkInterfaces;
os.networkInterfaces = () => {try {return networkInterfaces();} catch {return {};}};
