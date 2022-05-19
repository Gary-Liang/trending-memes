from flask import Flask

app = Flask(__name__)

# Members API Route
@app.route('/members')
def members():
    return {
    "members1": {
        "id": 1,
        "first_name": "Jeremiah",
        "last_name": "Duke",
        "image": "https://placekitten.com/g/200/302"
    },
    "members2": {
        "id": 2,
        "first_name": "Farleigh",
        "last_name": "Maguire",
        "image": "https://placekitten.com/g/201/302"
    },
    "members3": {
        "id": 3,
        "first_name": "Ossie",
        "last_name": "Ivic",
        "image": "https://placekitten.com/g/401/402"
    },
    "members4": {
        "id": 4,
        "first_name": "Sadie",
        "last_name": "Baigent",
        "image": "https://placekitten.com/g/351/352"
    },
    "members5": {
        "id": 5,
        "first_name": "Elwin",
        "last_name": "Northeast",
        "image": "https://placekitten.com/g/381/382"
    },
    "members6": {
        "id": 6,
        "first_name": "Domenico",
        "last_name": "Campey",
        "image": "https://placekitten.com/g/281/282"
    },
    "members7": {
        "id": 7,
        "first_name": "Harlie",
        "last_name": "Martensen",
        "image": "https://placekitten.com/g/420/400"
    },
    "members8": {
        "id": 8,
        "first_name": "Kerby",
        "last_name": "Grut",
        "image": "https://placekitten.com/g/444/444"
    },
    "members9": {
        "id": 9,
        "first_name": "Loraine",
        "last_name": "Cator",
        "image": "https://placekitten.com/g/260/270"
    },
    "members10": {
        "id": 10,
        "first_name": "De",
        "last_name": "Gentsch",
        "image": "https://placekitten.com/g/411/422"
    }, 
}


if __name__ == '__main__':
    app.run(debug=True)
    #app.run(port=5000)
