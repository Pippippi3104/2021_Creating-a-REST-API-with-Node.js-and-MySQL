## Creating a REST API with Node.js and MySQL

### Credentials

- Instance ID
  - barkbark
- password
  - 111111111!Qq

### Cloud Shell Terminal

- step 001: login

  - ```
    gcloud sql connect barkbark -u root
    ```
  - ctrl c: exit

- step 002: move
  - ```
    use dog_data;
    show tables;
    ```
- step 003: create
  - ```
    CREATE TABLE breeds (name varchar(30) UNIQUE, type varchar(30), lifeExpectancy INT, origin varchar(30));
    show tables;
    ```
- step 004: insert and select
  - ```
    INSERT INTO breeds VALUES ('poodle', 'sporting', 14, 'Germany');
    select * from breeds;
    ```

### Links

- [Creating a REST API with Node.js and MySQL](https://www.youtube.com/watch?v=_w_idf928WY)
