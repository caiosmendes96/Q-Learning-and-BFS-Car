Projeto com objetivo de resolução de problema utilizando o algoritmo de Busca em Profundidade e algoritmo de aprendizagem por reforço Q-Learning.

##

<h3>O problema:</h3> Um carro precisa ultrapassar um trecho da rodovia que está cheio de buracos. Seu objetivo é ultrapassar esse trecho sem cair em nenhum buraco.

Ambiente de codificação: Javascript utilizando a biblioteca visual 3d THREE.js para visualização na web.

O trecho da pista é uma matriz 13x4 de 1's, a posição que contém 0 é um buraco.

![image](https://github.com/user-attachments/assets/5ea0ef29-4668-45cb-97a9-d2d7d9a813e0)

O carro inicia na posição (0,0). </br>
Os buracos estão nas posições: (4,0); (4,1); (7,0); (9,1); (9,2); (11,3). </br>
O objetivo é chegar na posição (12,y) do trecho. </br>

##

<h3>Elementos gráficos:</h3>

- Modelo do carro 3D
- Textura da pista no plano
- Textura dos buracos
- Sombras/iluminação
<h6>Representação gráfica do problema no ThreeJS</h6>

![image](https://github.com/user-attachments/assets/891d5074-0284-4cb5-bcd5-1d71b03b2482)

##

<h3>Busca em Profundidade:</h3>

- O algoritmo verifica os possíveis caminhos a serem seguidos e os guarda em uma pilha  </br>
- Prioridade em Avançar -> Cima -> Baixo  </br>
- Caminhos que foram utilizados são marcados como visitados  </br>
- Ao encontrar um buraco retorna e tenta o próximo caminho
- Tenta todas as possibilidades  </br>
- Caso a pilha esvazie o objetivo não pode ser alcançado  </br>

##

<h3>Q-Learning:</h3>

O carro tem 3 ações possíveis: mover-se à direita, cima ou baixo. </br>

Recompensas: </br>
- Visitar uma posição já visitada: -2
- Visitar uma posição fora da pista: -1
- Visitar uma posição com buraco: -20
- Visitar uma posição dentro da pista e sem buraco: +1
- Visitar uma posição final (12,y): +10

<h3>Resultados</h3>

<img src="https://github.com/user-attachments/assets/88de52a6-6ba3-4cb8-9652-96840c49c0f9" align="center" height="400" width="800" > </br>

<img src="https://github.com/user-attachments/assets/1ee659b8-dafe-4eda-923f-9ea287646f7c" align="center" height="400" width="800" > </br>

<img src="https://github.com/user-attachments/assets/9c5842df-17e8-4671-8370-c33400eae3fb" align="center" height="400" width="800" > </br>

<img src="https://github.com/user-attachments/assets/70f82b79-6885-428f-9cab-649436d1341b" align="center" height="400" width="800" > </br>


##

<h3>Como executar:</h3>

Instale o Node.js e execute npx serve para iniciar um servidor local no diretório do projeto.
Executará em um ip local por exemplo: </br>
http://localhost:3000/CodigoBase/?qlearning </br>
http://localhost:3000/CodigoBase/?bfs </br>

https://threejs.org/docs/#manual/en/introduction/Installation </br>

Link para o vídeo do projeto sendo executado: https://www.youtube.com/watch?v=h_aAY2yXBiA


