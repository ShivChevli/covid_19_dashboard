import pandas as pd
from pytz import country_names

data = pd.read_csv("Data/full_grouped.csv")
clean_data = pd.read_csv("Data/covid_19_clean_complete.csv")

print(data.head())

contory = {}

print(data["Country/Region"])

for i in data["Country/Region"]:
    contory[i] = contory.get(i, 0) + 1

for i in contory:
    contory[i] = 0

for i in range(0, len(clean_data["Country/Region"])):
    # print(clean_data["Country/Region"][i])
    if(contory.get(clean_data["Country/Region"][i], 0) == 0):
        contory[clean_data["Country/Region"][i]] = {
            "let": clean_data["Lat"][i],
            "long": clean_data["Long"][i]
        }

print(contory)
