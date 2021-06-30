const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const { schemaPost } = require('./posts/postController') 

const app = express(); 
const PORT = 1337; 
app.use('/graphql', graphqlHTTP({ 
	schema: schemaPost, 
	graphiql: true 
}));

app.listen(PORT, () => { 
    console.log(`GraphQL server running at http://localhost:${PORT}.`) 
}) 
