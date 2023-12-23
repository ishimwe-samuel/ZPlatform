const tokenParser = (token) => {
  try {
    if (token !== null || token !== undefined) {
      const base64String = token.split(".")[1];
      const decodedValue = JSON.parse(
        Buffer.from(base64String, "base64").toString("ascii")
      );
      return decodedValue;
    }
    return null;
  } catch (error) {
    return "Invalid JWT";
  }
};
module.exports = tokenParser;
