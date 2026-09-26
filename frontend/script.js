let chart;

async function getProfile() {
  const username = document.getElementById("username").value.trim();

  if (username === "") {
    alert("Please enter a GitHub username");
    return;
  }

  document.getElementById("loader").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("error").style.display = "none";

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`
    );

    if (!response.ok) {
      throw new Error("User not found");
    }

    const data = await response.json();

    const user = data;
    const repos = await (await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`)).json();

    // Profile
    document.getElementById("avatar").src = user.avatar_url;
    document.getElementById("name").innerText =
      user.name || user.login;

    document.getElementById("bio").innerText =
      user.bio || "No bio available";

    document.getElementById("githubLink").href =
      user.html_url;

    // Statistics
    document.getElementById("followers").innerText =
      user.followers;

    document.getElementById("following").innerText =
      user.following;

    document.getElementById("repos").innerText =
      user.public_repos;

    // Total Stars
    let totalStars = 0;

    repos.forEach(repo => {
      totalStars += repo.stargazers_count;
    });

    document.getElementById("stars").innerText =
      totalStars;

    // GitHub Score
    let score =
      (user.followers * 2) +
      user.public_repos +
      totalStars;

    if (score > 100) score = 100;

    document.getElementById("scoreFill").style.width =
      score + "%";

    document.getElementById("scoreText").innerText =
      score + " / 100";

    // Repository Cards
    const repoList =
      document.getElementById("repoList");

    repoList.innerHTML = "";

    const topRepos =
      repos
        .sort(
          (a, b) =>
            b.stargazers_count -
            a.stargazers_count
        )
        .slice(0, 6);

    topRepos.forEach(repo => {
      repoList.innerHTML += `
        <div class="repo-card">
          <h3>${repo.name}</h3>

          <p>
            ⭐ Stars :
            ${repo.stargazers_count}
          </p>

          <p>
            🍴 Forks :
            ${repo.forks_count}
          </p>

          <p>
            💻 Language :
            ${repo.language || "N/A"}
          </p>

          <a
            href="${repo.html_url}"
            target="_blank"
          >
            View Repository
          </a>
        </div>
      `;
    });

    // Language Chart
    const languages = {};

    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] =
          (languages[repo.language] || 0) + 1;
      }
    });

    const labels =
      Object.keys(languages);

    const values =
      Object.values(languages);

    if (chart) {
      chart.destroy();
    }

    const ctx =
      document
        .getElementById("langChart")
        .getContext("2d");

    chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: values
          }
        ]
      }
    });

    document.getElementById("dashboard").style.display =
      "block";
  }
  catch (error) {
    document.getElementById("error").style.display =
      "block";
  }
  finally {
    document.getElementById("loader").style.display =
      "none";
  }
}
