import { gql } from "@apollo/client";

// corresponds to user.typeDef.js
export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      _id
      name
      username
    }
  }
`;
