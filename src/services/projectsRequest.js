import {Octokit} from "https://esm.sh/octokit"

export async function projectsRequest() {
    try {
        const response = await fetch('https://api.github.com/users/AirtonAdams/repos');
        if (!response.ok) {
            throw new Error('Erro na rede')
        }
        const data = await response.json();
        return dados;
    } catch (error) {
        console.log('Erro: ', error);
        return null
    }
}