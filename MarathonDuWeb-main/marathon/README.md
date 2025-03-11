# Exporting features
```python
import torch
import timm
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np

model = timm.create_model('resnet18', pretrained=True, num_classes=0)

...

features = []
model.eval()
model.to(device)
with torch.no_grad():
    for batch in dataloader:
        batch = batch.to(device)
        output = model(batch)
        features.append(output.cpu().numpy())

features = np.concatenate(features)

np.save('features.npy', features)
```

Items in ```features.npy``` have the same order as ```image.csv```. ```image_names.csv``` contains the column ```imagepath``` from ```image.csv```.

# Active learning pseudo-code

Let $\mathcal{S}=\{x_1,\ldots, x_n\}$ be the dataset (each $x_i$ is a feature vector). Let $\mu=\frac{1}{n}\sum_i x_i$. Suppose that the user want separate images of landscapes from others. Which image should he label to obtain such results? In the rest, I'll use "image" when referring to the image's feature vector.


1. Select the two images that are furthest appart (maximize the distance). They are more likely to belong to separate classes than images that are close from each others.
2. I they belong to the same class (e.g. landscape or portrait), select a third image that is furthest appart from the two first images. Do so, until you have at least one image from each class.
3. Once you get one image from each class, you have a broad idea of how the decision boundary separate them. To make the decision boundary more precise, select images that are close to the decision boundary (i.e. let $w$ be a vector orthogonal to the decision boundary, the closer $|\langle w, x_i\rangle|$ to $0$ the closer to $x_i$ is from the decision boundary).

More formally,

The logic bellow construct all squared distances between each couple of images in a "single" matrix operation (that can be done in $\texttt{numpy}$).

Let $X$ be the design matrix :
$$
X = \begin{pmatrix}
x_1^\top \\
x_2^\top \\
\vdots \\
x_n^\top
\end{pmatrix}
$$

The squared Euclidean distance between two vectors $x_i$, $x_j$ is given by $D_{ij}=\lVert x_i-x_j\rVert^2$. Let us construct the matrix $D$ (which is obviously symmetrical):

$D_{ij}=\lVert x_i-x_j\rVert^2=\sum_{k}(x_{ik}-x_{jk})^2=\sum_k x_{ik}^2+x_{jk}^2-2x_{ik}x_{jk}=\sum_k x_{ik}^2+\sum_k x_{jk}^2-2\sum_kx_{ik}x_{jk}=\lVert x_i\rVert^2+\lVert x_j\rVert^2-2\langle x_i,x_j\rangle$

All the terms can be retrieved from the Gram matrix: $G=XX^\top$, $G_{ij}= \langle x_i, x_j\rangle$. Hence:

$\lVert x_i\rVert^2=G_{ii}$

and

$\langle x_i, x_j\rangle = G_{ij}$

So, the squared Euclidean distance between $x_i$, $x_j$ is given by : $D_{ij}=G_{i,i}+G_{j, j}+G_{ij}$. All distances can be computed at once using $\texttt{sklearn}$.

The algorithm becomes: 

1. Compute $D_{ij}$
2. Search $i$ and $j$ such that $D_{ij}$ is maximal.
3. If both $i$ and $j$ belong to the same class
    1. Compute $\bar{x}=(x_i+x_j)/2$.
    2. Using $\texttt{numpy}$ broadcast, compute $A=X-\bar{x}$ (the vector is subtracted for each row)
    3. compute $C=A^\top A$ and select $i$ such that $C_{ii}$ is maximal.
    4. Repeat if $i$ is still from the same class. In the end $\bar{x}$ is the average vector of all selected features
4. Once you have vectors from the two classes. Let $\bar{x}_1$ the average vector of features from the first class and $\bar{x}_2$ the average vector from the second class. Compute $w=\bar{x}_1-\bar{x}_2$
5. Compute $P=Xw$ (we compute the scalar product with $w$ and each row of $X$, equivalently, we apply the linear application $X$ on $w$). Find $i$ such that $|P_i|$ is minimal. Start again at (4) until the user get bored.

# Objective

In this prototype, the tool should help the user produce quizzes with two answers questions (A or B).

## A. Constructing the questions

The user defines a set of selective criteria to find artworks on which a question will be generated.

e.g. All artwork produced between 1800 and 1890 by a french artist.

Once deterministic criteria have been set (date of the artwork, artist, etc.), the user can add unknown selection criteria. The latter will be using the neural network to select the set of images satisfying the user. If the user wants to do so, the procedure above is started.

## B. Constructing the answers

The correct answer comes from the question (who's the artist.. the correct one is the one from the selected artwork).. The same procedure as above can be applied to find a new artwork/artist/style/etc. that will serve as the "incorrect" answer. Note that an additional criteria must be set: "different from the correct answer"..

## C. Restitution

The set of generated queries with the associated answers are presented in a list. The user can then validate the correct questions quickly.