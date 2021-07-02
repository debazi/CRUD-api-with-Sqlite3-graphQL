

Dans ce tutoriel, nous allons mettre en place une API CRUD en GraphQL avec une base de données SQLite3 sur NodeJS. 

#GraphQL c’est quoi ?
 
GraphQL (Graph Query Language) est un langage de requêtes et un environnement d’exécution. Il a été créé en 2012 par Facebook et est open-source depuis 2015. C’est une alternative aux traditionnelles API REST. Contrairement à une API REST, GraphQL se concentre sur un seul endpoint. 

#On peut diviser GraphQL en 2 parties :

# 1- Query : requêtes de lectures de type GET
# 2- Mutation : requêtes de modifications de type POST, UPDATE, DELETE, etc…
Nous allons partir sur une API minimaliste avec une table de blog pour effectuer des queries et des mutations. Pour exécuter nos requêtes GraphQL, nous utiliserons l’IDE GraphiQL.

Préparation
Pour ce faire, vérifiez au préalable que NodeJS et NPM sont bien installés sur votre machine.

#node –v && npm -v
Après vérification, créez un nouveau répertoire “graphql-blog” et un nouveau dossier à l’intérieur “api”. Initialisez un projet NPM à l’intérieur de ce dernier.

#mkdir graphql-blog && cd graphql-blog && mkdir api && cd api && npm init –y 

Puis installez les paquets “graphql”, “express”, “express-graphql” et “sqlite3”. 

#npm i graphql express express-graphql sqlite3 

Ainsi que le paquet “nodemon”. 

#npm i --save-dep nodemon 
Pour que ce dernier fonctionne, ouvrez le fichier “package.json” et dans la ligne “scripts”, ajoutez la ligne ci-dessous.

#"dev": "node_modules/.bin/nodemon", 

Vous pouvez désormais lancer le serveur avec la commande npm run dev. 

Création du serveur 
Créez un nouveau fichier “index.js”. 

######## js

const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const { schemaPost } = require('./posts/postController') 

const app = express(); 
const PORT = 4000; 
app.use('/graphql', graphqlHTTP({ 
	schema: schemaPost, 
	graphiql: true 
}));

app.listen(PORT, () => { 
    console.log(`GraphQL server running at http://localhost:${PORT}.`) 
}) 

######

Dans cette partie, on déclare une route “/graphql” dans laquelle on pourra exécuter nos futures requêtes avec GraphiQL.
Remarque : dans un environnement de prod, il est fortement recommandé de désactiver cet outil en passant la valeur à “false” ou en mettant en place une authentification.

Connecteur SQLite 3
Créez un nouveau répertoire “db” et un nouveau fichier à l’intérieur “sqliteConnector.js”. Ce fichier va nous servir à nous connecter au fichier de la base de données “micro-blog.db”.

########

const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('micro-blog.db');

const query = `
    CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    createDate TEXT,
    author TEXT)`

database.run(query)

module.exports = {
    database
}

######


On en profite également pour créer la table “posts” et ainsi générer le fichier “micro-blog.db”.

Création du modèle
Dans le dossier “api”, créez un nouveau dossier “posts” avec un fichier “postsModel.js”.

#############

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

############

Dans ce fichier, on déclare le schéma de l’entité “Post”. Ainsi, on retrouve les mêmes champs et le même typage que dans la table “posts”.

Queries
Dans le dossier “posts”, créez un second fichier “postQuery.js”. Dans ce fichier, nous allons déclarer nos requêtes de type GET.

############
const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID } = require('graphql');
const { database } = require('../db/sqliteConnector');
const { PostType } = require('./postsModel');
On commence par importer les modules. Puis dans une constante, on déclare un nouvel objet Graphql dans lequel on déclare un nom et des champs.

const queryPostType = new GraphQLObjectType({ 
    // Nom de l'objet
    name: 'PostQuery',
    // Liste des champs
    fields: { 
        // Récupération de tous les posts
        Posts: { 
        }, 
        // Récupération d'un seul post
        Post: { 
        }
    } 
})

############

On déclare 2 types de champs “Posts” pour récupérer la liste des posts et “Post” pour récupérer un seul post.

Récupération de toutes les lignes
Pour la liste des posts, on déclare l’objet GraphQLlist car on veut récupérer une liste d’objets. Et dans le résolveur, on exécute la requête SQL.

 

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
Récupération d’une seule ligne
Pour récupérer un post, on déclare l’objet PostType car on veut récupérer un seul objet. En argument, on déclare uniquement l’id. Et dans le résolveur, on exécute la requête permettant de récupérer la ligne concernée.

 

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
Et on exporte notre objet GraphQL.

module.exports = {
    queryPostType
}
Mutations
Dans le dossier “posts”, créez un troisième fichier “postMutation.js”. Dans ce fichier, nous allons déclarer nos requêtes de type POST, UPDATE et DELETE.

const { GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLString } = require('graphql');
const { database } = require('../db/sqliteConnector');
const { PostType } = require('./postsModel');

On commence par importer les modules. Puis dans une constante, on déclare un nouvel objet GraphQL.

 

const mutationPostType = new GraphQLObjectType({ 
    name: 'PostMutation',
    fields: { 
        // Création d'un nouveau post
        createPost: { 
        },
 
        // Modification d'un post
        updatePost: { 
        },
 
        // Suppression d'un post
        deletePost: { 
        }
})
On déclare 3 types de champs :

“ createPost” pour ajouter un nouveau post ;
“updatePost” pour modifier un post ;
“deletePost” pour supprimer un post.
Création d’une nouvelle ligne
Pour ajouter un post, on déclare l’objet PostType. En argument, on déclare tous les champs sauf l’id. Et dans le résolveur, on exécute la requête permettant d’insérer une nouvelle ligne, une seconde pour récupérer l’id. Cette dernière permet d’afficher l’objet complet.

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
Modification d’une ligne
Pour modifier un post, on déclare l’objet de type String. En argument, on déclare tous les champs. Et dans le résolveur, on exécute la requête permettant de modifier la ligne.

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
Suppression d’une ligne
Pour supprimer un post, on déclare l’objet de type String. En argument, on déclare uniquement le champ de l’id. Et dans le résolveur, on exécute la requête permettant de supprimer la ligne.

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
Et on exporte notre objet GraphQL.

module.exports = {
    mutationPostType
}
Contrôleur
Dans le dossier “post”, créez un quatrième et dernier fichier “postController.js”.

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

Dans ce fichier, on déclare un schéma en se basant sur les 2 fichiers précédents (postQuery et postMutation). 
Ce schéma est appelé dans le fichier index.js.

Exécution des requêtes
Rendez-vous sur la page http://localhost:4000/graphql. En haut à droite, cliquez sur le bouton “Docs”. 
Puis dans “Root Type”, on constate que “PostQuery” et “PostMutation” sont bien déclarés.

#Ajouter une ligne
mutation {
  createPost(title: "Mon premier post", description: "lorem ipsum", createDate:"25-12-2019", author: "Nova") {
    id,
    title,
    description,
    createDate,
    author
  }
}

#Lire la liste des lignes
{
  Posts{
    id,
    title,
    description,
    createDate,
    author
  }
}

#Lire une ligne
#Pour récupérer une ligne via son id.
{
  Post(id:1) {
    id,
    title,
    description,
    createDate,
    author
  }
}

#Modifier une ligne
mutation {
  updatePost(
    id:1,
    title: "Mon premier post",
    description: "lorem ipsum modifié",
    createDate: "25-12-2019",
    author: "Nova"
  )
}

#Supprimer une ligne
mutation {
  deletePost(id:1)
}
 
