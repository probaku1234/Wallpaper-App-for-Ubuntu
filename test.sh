#!/bin/bash

# images directory
rep=$1
switchTime=$2
echo $rep
echo $switchTime

# Create image list from directory
liste=("${rep}/"*)

# Compute the number of images
nbre=${#liste[@]}

# Random select
echo $liste
echo $nbre

# Image loading
while :
do
    selection=$((${RANDOM} % ${nbre}))
    uri="file://${liste[${selection}]}"
    echo $selection
    echo $uri
    gsettings set org.gnome.desktop.background picture-uri "${uri}"
    sleep $switchTime
done