const { GraphQLObjectType, GraphQLID, GraphQLString } = require('graphql')
 
// Schéma de l'entité "Post"
const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: {
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        createDate: { type: GraphQLString },
        author: { type: GraphQLString }
    },
})
 
module.exports = {
    PostType
}
