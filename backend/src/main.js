const {app} = require("./app.js");


const port = 3000;

//Run Server
try{
  app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
} catch (error){
  console.log("Unable to start up the app");
  console.log(error);
}