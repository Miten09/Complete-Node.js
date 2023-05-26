const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log(process.env);
//123
//4566669999

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App Runnig on port ${port}`);
});
