
# Sangue Bom - Backend

O backend do meu projeto de conclusão de curso é uma aplicação Node.js que fornece uma API para a criação de campanhas de sangue. Utilizando o framework Express.js, o backend se integra com um banco de dados Postgres para armazenar informações de doadores, bancos de sangue e alertas. Além disso, o backend implementa autenticação JWT para garantir a segurança das informações dos usuários.


## Stack utilizada


**Back-end:** NodeJS, Express, Prisma, Postgres, TypeScript e JWT


## Documentação da API
baseURL: https://sangue-bom.onrender.com/

#### Criar um novo usuário

```http
  POST auth/create
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `email` | `string` | **Obrigatório**. Email do novo usuário |
| `bloodType` | `string` | **Obrigatório**. Tipo sanguíneo do novo usuário |
| `username` | `string` | **Obrigatório**. Nome do usuário |
| `password` | `string` | **Obrigatório**. Senha >= 8 caracteres |

#### Login

```http
  POST auth/login
```

| Parâmetro   | Tipo       |
| :---------- | :---------  |
| `email`      | `string` | 
| `password`      | `string` | 




#### Atualizar os dados de um usuário ou ponto de coleta de sangue
tipo de dado a ser enviado: **multipart/form-data**

```http
  PUT auth/update
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `email`      | `string` | **Obrigatório**. Novo email  |
| `password`      | `string` | **Obrigatório**. Nova senha |
| `bloodType`      | `string` | **Obrigatório**. Novo tipo sanguíneo |
| `phoneNumber`      | `string` | **Obrigatório**. Novo número de telefone |
| `username`      | `string` | **Obrigatório**. Novo nome de usuário |
| `adress`      | `string` | **Obrigatório**. Novo endereço|
| `uid`      | `string` | **Obrigatório**. Iud do usuário a ser atualizado|
| `avatar`      | `Express.Multer.File` | **Obrigatório**. Nova foto de perfil|


#### Criar um ponto de coleta de sangue
tipo de dado a ser enviado: **multipart/form-data**

```http
  POST bloodcollectors/create
```

| Parâmetro   | Tipo       |
| :---------- | :---------  |
| `email`      | `string` | 
| `password`      | `string` | 
| `phoneNumber`      | `string` | 
| `username`      | `string` | 
| `adress`      | `string` |
| `avatar`      | `Express.Multer.File` | 

#### Listando e filtrando os pontos de coleta

```http
  GET bloodcollectors/?name={nome do ponto de coleta}
```

#### Criar uma postagem
tipo de dado a ser enviado: **multipart/form-data**

```http
  POST posts
```

| Parâmetro   | Tipo       |
| :---------- | :---------  |
| `linkRedirect `      | `string` | 
| `adress`      | `string` | 
| `description`      | `string` | 
| `bloodCollectorsID`      | `string` | 
| `banner`      | `Express.Multer.File` | 

#### Atualizar uma postagem
tipo de dado a ser enviado: **multipart/form-data**

```http
  POST posts
```

| Parâmetro   | Tipo       | Descrição |
| :---------- | :---------  | :--------- |
| `linkRedirect `      | `string` | 
| `adress`      | `string` | 
| `description`      | `string` | 
| `id`      | `string` | **Obrigatório**. ID da postagem a ser atualizada
| `banner`      | `Express.Multer.File` | 

#### Listar postagens

```http
  GET posts
```


#### Criar/atualizar um alerta

```http
  POST alert
```

| Parâmetro   | Tipo       | Descrição |
| :---------- | :---------  | :--------- |
| `bloodTypes `      | `string[]` | 
| `status`      | `boolean` | 
| `bloodCollectorsID`      | `string` | **Obrigatório**. ID do ponto de coleta

#### Listar os alertas

```http
  GET alert
```

**IMPORTANTE** Muitas das rodas utlizam um middleware de autenticação. Envie seu token recebido no login dentro do **Bearer Token**


## Variáveis de Ambiente

Caso queira testar o projeto, adicione o arquivo .env na raiz do projeto com as seguintes variáveis:

`DATABASE_URL`

`JWT_PASS`


## Autor

- Feito com 🧡 por [Vinicius B. Leite](https://www.linkedin.com/in/vinicius-b-leite/)

