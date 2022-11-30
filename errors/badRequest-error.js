import CustomAPIError from "./customAPI-error.js";

class badRequest extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

export default badRequest;