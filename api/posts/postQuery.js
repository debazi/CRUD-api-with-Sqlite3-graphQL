const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID } = require('graphql');
const { database } = require('../db/sqliteConnector');
const { PostType } = require('./postsModel');

const queryPostType = new GraphQLObjectType({ 
    // Nom de l'objet
    name: 'PostQuery',
    // Liste des champs
    fields: { 
// Récupération de tous les posts
Posts: { 
    type: GraphQLList(PostType), 
    resolve: () => { 
        return new Promise((resolve, reject) => { 
            database.all("SELECT * FROM posts;", (err, rows) => {
                err ? reject([]) : resolve(rows)
            }) 
        })
    }
}, 
// Récupération d'un seul post
Post:{
    type: PostType,
    args: {
        id: {
            type: new GraphQLNonNull(GraphQLID)
        }            
    },
    resolve: (_, { id }) => {
        return new Promise((resolve, reject) => {
            database.all("SELECT * FROM posts WHERE id = (?) LIMIT 1;", [id], (err, rows) => {
                err ? reject(null) : resolve(rows[0])
            })
        })
    }
}
    } 
})

module.exports = {
    queryPostType
}
