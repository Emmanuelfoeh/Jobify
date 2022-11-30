import CustomAPIError from "./customAPI-error.js";

 class unauthenticated extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
};

export default unauthenticated;