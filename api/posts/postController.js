const { GraphQLSchema } = require('graphql');
const { queryPostType } = require('./postQuery');
const { mutationPostType} = require('./postMutation');
 
const schemaPost = new GraphQLSchema({
    query: queryPostType,
    mutation: mutationPostType
})

module.exports = {
    schemaPost
}
