function generateRandomString() {
var randomNum = "";
  var source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    randomNum += source.charAt(Math.floor(Math.random() * source.length));
  }
return randomNum;
}

generateRandomString()