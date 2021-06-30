const { GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLString } = require('graphql');
const { database } = require('../db/sqliteConnector');
const { PostType } = require('./postsModel');

const mutationPostType = new GraphQLObjectType({ 
    name: 'PostMutation',
    fields: { 

// Création d'un nouveau post 
createPost: {
    type: PostType,
    args: {
        title: {
            type: new GraphQLNonNull(GraphQLString)
        },
        description: {
            type: new GraphQLNonNull(GraphQLString)
        },
        createDate: { 
            type: new GraphQLNonNull(GraphQLString)
        },
        author: { 
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    resolve: (_, { title, description, createDate, author }) => {
        return new Promise((resolve, reject) => {
            database.run(
                'INSERT INTO posts (title, description, createDate, author) VALUES (?,?,?,?);',
                [title, description, createDate, author],
                (err) => {
                    if (err) {
                        reject (null)
                    }
                    database.get('SELECT last_insert_rowid() as id', (err, row) => {
                        resolve({
                            id: row["id"],
                            title: title,
                            description: description,
                            createDate:createDate,
                            author: author
                        })
                    })
            })
        })
    }
},
// Modification d'un post
updatePost: {
    type: GraphQLString,
    args: {
        id: { 
            type: new GraphQLNonNull(GraphQLID)
        },
        title: {
            type: new GraphQLNonNull(GraphQLString)
        },
        description: { 
            type: new GraphQLNonNull(GraphQLString)
        },
        createDate: {
            type: new GraphQLNonNull(GraphQLString)
        },
        author: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    resolve: (_, { id, title, description, createDate, author }) => {
        return new Promise((resolve, reject) => {
            database.run(
                'UPDATE posts SET title = (?), description = (?), createDate = (?), author = (?) WHERE id = (?);',
                [title, description, createDate, author, id],
                (err) => {
                    err ? reject(err) : resolve(`Post #${id} updated`)
            })
        })
    }
},
// Suppression d'un post
deletePost: {
    type: GraphQLString,
    args: {
        id: {
            type: new GraphQLNonNull(GraphQLID)
        }
    },
    resolve: (_, { id }) => {
        return new Promise((resolve, reject) => {
            database.run('DELETE FROM Posts WHERE id =(?);', [id], (err) => {
                err ? reject(err) : resolve(`Post #${id} deleted`)
            })
        })
    }
}


}
})

module.exports = {
    mutationPostType
}
