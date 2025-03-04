import requests

def get_request(url):
    req = requests.api.get(url, params="select=*", headers=
        {
            "apikey": "vaq1Ijq7UawPOZpXt7hVfBrilg6rfFtyPYCy6t9E4OuXvLirPwXXU1VfzqzKy9rS",
          "Authorization": "vaq1Ijq7UawPOZpXt7hVfBrilg6rfFtyPYCy6t9E4OuXvLirPwXXU1VfzqzKy9rS", 
          "content-type": "application/json", 
          "Prefer": "return=minimal"
          }
        )
    result = req.json()
    return result

users = get_request("http://10.147.17.253:8000/rest/v1/Users")
print(users)