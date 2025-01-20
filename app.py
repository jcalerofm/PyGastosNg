import smtplib
import traceback
from flask import Flask, make_response, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, methods=['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE'], supports_credentials=True)


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/AppGastos'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(50), nullable=False)

class Gastos(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.Date, nullable=False)
    concept = db.Column(db.String(100), nullable=False)
    category = db.Column(db.Enum('Compras', 'Ocio', 'Hogar', 'Transporte', 'Otros'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

# Todos los gastos de un usuario
@app.route('/api/gastos/<int:user_id>', methods=['GET'])
def get_gastos(user_id):
    gastos = Gastos.query.filter_by(user_id=user_id).all()
    result = []
    for gasto in gastos:
        gasto_data = {
            'id': gasto.id,
            'date': gasto.date,
            'concept': gasto.concept,
            'category': gasto.category,
            'amount': str(gasto.amount),
            'user_id': gasto.user_id
        }
        result.append(gasto_data)
    return jsonify(result)

# add gasto a un usuario específico
@app.route('/api/gastos/<int:user_id>', methods=['POST'])
@cross_origin(origin='*', methods=['GET', 'POST', 'PUT', 'DELETE'], headers=['Content-Type'])
def add_gasto(user_id):
    print("Solicitud recibida para agregar gasto")
    gasto = Gastos(
        date=request.json['date'],
        concept=request.json['concept'],
        category=request.json['category'],
        amount=request.json['amount'],
        user_id=user_id
    )
    print("Received gasto from frontend:", request.json)
    print("Created gasto object:", gasto)
    db.session.add(gasto)
    db.session.commit()
    # # return the details of the new gasto to the frontend
    gasto_data = {
        'id': gasto.id,
        'date': gasto.date,
        'concept': gasto.concept,
        'category': gasto.category,
        'amount': str(gasto.amount),
        'user_id': gasto.user_id
    }
    return jsonify(gasto_data)

# update gasto de un usuario
@app.route('/api/gastos/<int:user_id>/<int:gasto_id>', methods=['PUT'])
def update_gasto(user_id, gasto_id):
    print(f"Actualizar gasto solicitado: {user_id} {gasto_id}")
    gasto = Gastos.query.filter_by(id=gasto_id, user_id=user_id).first()
    if gasto:
        print("Gasto encontrado")
        date_str = request.json['date']
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        date_formatted = date_obj.strftime('%Y-%m-%d')

        gasto.date = date_formatted
        gasto.concept = request.json['concept']
        gasto.category = request.json['category']
        gasto.amount = request.json['amount']

        # Imprimir los valores actualizados
        print(f"Valores actualizados: date={gasto.date}, concept={gasto.concept}, category={gasto.category}, amount={gasto.amount}")

        db.session.flush()
        db.session.commit()

        # Verificar si los cambios se guardaron en la base de datos
        updated_gasto = Gastos.query.filter_by(id=gasto_id, user_id=user_id).first()
        if updated_gasto:
            print(f"Gasto actualizado en la base de datos: date={updated_gasto.date}, concept={updated_gasto.concept}, category={updated_gasto.category}, amount={updated_gasto.amount}")
        else:
            print("El gasto actualizado no se encontró en la base de datos")

        return jsonify({'message': 'Gasto actualizado correctamente'})
    print("No se encontró el gasto")
    return jsonify({'message': 'No se encontró el gasto'})



# delete gasto de un usuario
@app.route('/api/gastos/<int:user_id>/<int:gasto_id>', methods=['DELETE'])
def delete_gasto(user_id, gasto_id):
    gasto = Gastos.query.filter_by(id=gasto_id, user_id=user_id).first()
    if gasto:
        db.session.delete(gasto)
        db.session.commit()
        return jsonify({'message': 'Gasto eliminado correctamente'})
    return jsonify({'message': 'No se encontró el gasto'})

# registrar nuevo usuario
@app.route('/api/users', methods=['POST'])
def add_user():
    user = Users(
        name=request.json['name'],
        email=request.json['email'],
        password=request.json['password']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Usuario agregado correctamente'})

# login de usuario
# login de usuario
@app.route('/api/users/login', methods=['POST'])
def login_user():
    user = Users.query.filter_by(email=request.json['email'], password=request.json['password']).first()
    if user:
        user_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'password': user.password
        }
        return jsonify(user_data)
    return jsonify({'message': 'Login incorrecto'})


# get user by id
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
  user = Users.query.filter_by(id=user_id).first()
  if user:
      user_data = {
          'id': user.id,
          'name': user.name,
          'email': user.email,
          'password': user.password
      }
      return jsonify(user_data)
  return jsonify({'message': 'No se encontró el usuario'})

# delete user by id
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
  user = Users.query.filter_by(id=user_id).first()
  if user:
      db.session.delete(user)
      db.session.commit()
      return jsonify({'message': 'Usuario eliminado correctamente'})
  return jsonify({'message': 'No se encontró el usuario'})

#update user by id
@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
  user = Users.query.filter_by(id=user_id).first()
  if user:
      user.name = request.json['name']
      user.email = request.json['email']
      user.password = request.json['password']
      db.session.commit()
      return jsonify({'message': 'Usuario actualizado correctamente'})
  return jsonify({'message': 'No se encontró el usuario'})

# get all users
@app.route('/api/allUsers', methods=['GET'])
def get_all_users():
  users = Users.query.all()
  result = []
  for user in users:
      user_data = {
          'id': user.id,
          'name': user.name,
          'email': user.email,
          'password': user.password
      }
      result.append(user_data)
  return jsonify(result)


@app.route('/api/contacto', methods=['POST'])
def send_email():
  try:
    data = request.get_json()

    nombre = data['nombre']
    email = data['email']
    mensaje = data['mensaje']

    # Configurar los datos del correo electrónico
    mi_email = "YOUR_EMAIL@EMAIL.COM"
    mi_password = "YOUR_PASSWORD"

    msg = MIMEMultipart()
    msg['From'] = mi_email
    msg['To'] = mi_email
    msg['Subject'] = f"Mensaje de contacto de {nombre} <{email}>"

    msg.attach(MIMEText(mensaje, 'plain'))

    # Enviar el correo electrónico
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(mi_email, mi_password)
    server.send_message(msg)
    server.quit()

    return jsonify({"status": "success"})
  except Exception as e:
        print("Error al enviar el correo electrónico:", e)
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": "Error al enviar el correo electrónico"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)