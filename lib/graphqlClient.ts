// lib/graphqlClient.js
import { GraphQLClient } from "graphql-request";
import { api_content_endpoint } from "../constants";

export const graphQLClient = new GraphQLClient(api_content_endpoint);
