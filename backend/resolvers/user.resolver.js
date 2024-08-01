// import { users } from "../dummyData/data.js";
// import { users } from "../dummyData/data";
import { users } from "../dummyData/data.js";

const userResolver = {
  Query: {
    users: () => {
      return users;
    },
  },
  Mutation: {},
};

export default userResolver;
