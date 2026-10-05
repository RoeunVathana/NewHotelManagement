# USERS
npx sequelize-cli model:generate --name User --attributes username:string,password:string

# USER PROFILE
npx sequelize-cli model:generate --name UserProfile --attributes user_id:integer,first_name:string,last_name:string,gender:string,phone:string,address:text,image:string

# ROLE
npx sequelize-cli model:generate --name Role --attributes role_name:string,status:boolean

# USER ROLE
npx sequelize-cli model:generate --name UserRole --attributes user_id:integer,role_id:integer

# PERMISSION GROUP
npx sequelize-cli model:generate --name PermissionGroup --attributes group_name:string

# PERMISSION
npx sequelize-cli model:generate --name Permission --attributes permission_name:string,group_id:integer,route_name:string

# PERMISSION ROLE
npx sequelize-cli model:generate --name PermissionRole --attributes role_id:integer,permission_id:integer

# CUSTOMERS
npx sequelize-cli model:generate --name Customer --attributes first_name:string,last_name:string,gender:string,phone:string,email:string,nationality:string,passport_no:string,address:text

# EMPLOYEES
npx sequelize-cli model:generate --name Employee --attributes full_name:string,gender:string,phone:string,email:string,role:string,salary:decimal,hire_date:date

# ROOM TYPES
npx sequelize-cli model:generate --name RoomType --attributes name:string,price_per_night:decimal,max_guest:integer,description:text

# ROOMS
npx sequelize-cli model:generate --name Room --attributes room_number:string,room_type_id:integer,floor:integer,status:string,description:text

# RESERVATIONS
npx sequelize-cli model:generate --name Reservation --attributes customer_id:integer,reservation_date:date,check_in_date:date,check_out_date:date,total_guest:integer,status:string,note:text

# RESERVATION DETAILS
npx sequelize-cli model:generate --name ReservationDetail --attributes reservation_id:integer,room_id:integer,price:decimal,nights:integer,subtotal:decimal

# CHECK INS
npx sequelize-cli model:generate --name CheckIn --attributes reservation_id:integer,employee_id:integer,checkin_time:date,deposit:decimal

# CHECK OUTS
npx sequelize-cli model:generate --name CheckOut --attributes reservation_id:integer,employee_id:integer,checkout_time:date,total_amount:decimal,damage_fee:decimal,discount:decimal

# PAYMENTS
npx sequelize-cli model:generate --name Payment --attributes reservation_id:integer,amount:decimal,payment_method:string,payment_date:date,transaction_id:string,status:string

# SERVICES
npx sequelize-cli model:generate --name Service --attributes service_name:string,price:decimal,description:text

# SERVICE ORDERS
npx sequelize-cli model:generate --name ServiceOrder --attributes reservation_id:integer,service_id:integer,quantity:integer,total:decimal,order_date:date