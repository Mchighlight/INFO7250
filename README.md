# demo-api
Plan Api Server - with Express


### 1. Run `npm install` to install all of the dependencies

### 2. in `config` folder create `dev.js` file so you have `config/dev.js` and specify following:
```javascript
module.exports = {
    REDIS_PORT : 
    REDIS_HOST : 
    REDIS_PASSWORD :
    REDIS_EXPIRE : 60
}
```
### 3. server will run on 
```
http://localhost:3001
```
### 4. run locally `npm run dev`

#Demo1
#### 
## Rest API that can handle any structured data in Json
#### Specify URIs, status codes, headers, data model, version
## Rest API with support for crd operations
#### Post, Get, Delete
## Rest API with support for validation
#### Json Schema describing the data model for the use case
## Controller validates incoming payloads against json schema
## The semantics with ReST API operations such as update if not changed/read if changed
#### Update not required
#### Conditional read is required
## Storage of data in key/value store
#### Must implement use case provided