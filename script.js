document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        if (theme === 'dark-mode') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark-mode' : '';
            localStorage.setItem('theme', currentTheme);
            updateThemeIcon(currentTheme);
        });
    }

    // Typed Text Effect
    const typedTextElement = document.querySelector('.typed-text');
    const roles = ['Trainee Decision Scientist'];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeText() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typedTextElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        // if (!isDeleting && charIndex === currentRole.length) {
        //     setTimeout(() => { isDeleting = true; }, 2000);
        // } else if (isDeleting && charIndex === 0) {
        //     isDeleting = false;
        //     roleIndex = (roleIndex + 1) % roles.length;
        // }

        setTimeout(typeText, isDeleting ? 50 : 100);
    }

    if (typedTextElement) {
        typeText();
    }

    // Blog Posts Fetching (Safely wrapped)
    const blogPostsContainer = document.getElementById('blog-posts');
    const blogModal = document.getElementById('blog-modal');
    const blogModalContent = document.getElementById('blog-modal-content');
    const blogModalClose = blogModal.querySelector('.close');

    if (blogPostsContainer && blogModal && blogModalContent) {
        async function fetchBlogPosts() {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/posts');
                const posts = await response.json();
                
                // Display first 5 posts
                posts.slice(0, 5).forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.classList.add('blog-post');
                    
                    // Truncate body to 20 words
                    const snippet = post.body.split(' ').slice(0, 20).join(' ') + '...';
                    
                    postElement.innerHTML = `
                        <h3>${post.title}</h3>
                        <p>${snippet}</p>
                        <button class="btn btn-secondary read-more" data-id="${post.id}">Read More</button>
                    `;
                    
                    blogPostsContainer.appendChild(postElement);
                });

                // Add event listeners for Read More buttons
                // document.querySelectorAll('.read-more').forEach(button => {
                //     button.addEventListener('click', async (e) => {
                //         const postId = e.target.dataset.id;
                //         const postResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
                //         const post = await postResponse.json();
                        
                //         blogModalContent.innerHTML = `
                //             <h2>${post.title}</h2>
                //             <p>${post.body}</p>
                //         `;
                        
                //         blogModal.style.display = 'block';
                //     });
                // });
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            }
        }

        // Only fetch if container exists
        fetchBlogPosts();
    }

    if (blogModalClose) {
        blogModalClose.onclick = () => {
            blogModal.style.display = 'none';
        };
    }

    // Blog Section - Fetch Posts from API
    async function fetchBlogPostsAPI() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            const posts = await response.json();

            // Select blog container (assuming you have a blog section in HTML)
            const blogContainer = document.getElementById('blog-posts');
            
            // Limit to first 6 posts for brevity
            const displayPosts = posts.slice(0, 6);

            // Create blog post elements
            displayPosts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('blog-post');
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.body.length > 100 ? post.body.substring(0, 100) + '...' : post.body}</p>
                    <a href="#" class="read-more" data-id="${post.id}">Read More</a>
                `;
                blogContainer.appendChild(postElement);
            });

            // Add event listeners for read more
            const readMoreButtons = document.querySelectorAll('.read-more');
            readMoreButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const postId = e.target.getAttribute('data-id');
                    await fetchPostDetails(postId);
                });
            });
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            const blogContainer = document.getElementById('blog-posts');
            blogContainer.innerHTML = '<p>Unable to load blog posts. Please try again later.</p>';
        }
    }

    // Fetch detailed post information
    async function fetchPostDetails(postId) {
        try {
            // Fetch post details and comments
            const [postResponse, commentsResponse] = await Promise.all([
                fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`),
                fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
            ]);

            const post = await postResponse.json();
            const comments = await commentsResponse.json();

            // Create modal for post details
            const modal = document.createElement('div');
            modal.classList.add('blog-modal');
            modal.innerHTML = `
                <div class="blog-modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>${post.title}</h2>
                    <p>${post.body}</p>
                    
                    <h3>Comments (${comments.length})</h3>
                    <div class="blog-comments">
                        ${comments.map(comment => `
                            <div class="comment">
                                <h4>${comment.name}</h4>
                                <p>${comment.body}</p>
                                <small>${comment.email}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            // Add modal to body
            document.body.appendChild(modal);

            // Close modal functionality
            const closeModal = modal.querySelector('.close-modal');
            closeModal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        } catch (error) {
            console.error('Error fetching post details:', error);
        }
    }

    // Call fetchBlogPostsAPI when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        const blogContainer = document.getElementById('blog-posts');
        if (blogContainer) {
            fetchBlogPostsAPI();
        }
    });

    // Project Gallery (Dynamic)
    const projectGallery = document.getElementById('project-gallery');

    const projects = [
        {
            title: 'E-commerce Platform',
            description: 'A comprehensive full-stack e-commerce website built with React, Node.js, and MongoDB. Features include user authentication, product browsing, cart management, and secure checkout.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express']
        },
        {
            title: 'Weather Forecast App',
            description: 'Real-time weather tracking application using OpenWeatherMap API. Provides detailed weather information, 5-day forecast, and location-based services.',
            technologies: ['JavaScript', 'API', 'Responsive Design']
        },
        {
            title: 'Task Management System',
            description: 'Kanban-style task management application with drag-and-drop functionality. Includes user authentication, real-time updates, and project tracking.',
            technologies: ['React', 'Redux', 'Firebase']
        },
        {
            title: 'Social Media Dashboard',
            description: 'Responsive social media analytics dashboard with real-time data visualization. Integrates multiple social media platform APIs.',
            technologies: ['Vue.js', 'Chart.js', 'Social Media APIs']
        },
        {
            title: 'Portfolio Website',
            description: 'Personal portfolio website showcasing web development skills and projects. Responsive design with dark mode and smooth animations.',
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design']
        },
        {
            title: 'Travel Booking Platform',
            description: 'Hotel and travel booking web application with advanced search filters, user reviews, and secure payment integration.',
            technologies: ['React', 'Node.js', 'Stripe', 'GraphQL']
        },
        {
            name: 'Python',
            icon: 'fab fa-python',
            level: 65,
            color: '#3776AB'
        },
        {
            name: 'Git',
            icon: 'fab fa-git-alt',
            level: 85,
            color: '#F05032'
        },
        {
            name: 'Responsive Design',
            icon: 'fas fa-mobile-alt',
            level: 90,
            color: '#4CAF50'
        }
    ];

    function createProjectGallery() {
        if (projectGallery) {
            projectGallery.innerHTML = ''; // Clear existing content

            projects.forEach((project) => {
                const projectCard = document.createElement('div');
                projectCard.classList.add('project-card');
                
                projectCard.innerHTML = `
                    <div class="project-card-content">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-technologies">
                            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    </div>
                `;
                
                projectGallery.appendChild(projectCard);
            });
        }
    }

    // Create project gallery
    createProjectGallery();

    // Skills Section
    const skillsContainer = document.getElementById('skills-container');

    const skills = [
        {
            name: 'HTML5',
            icon: 'fab fa-html5',
            level: 90,
            color: '#E34F26'
        },
        {
            name: 'CSS3',
            icon: 'fab fa-css3-alt',
            level: 85,
            color: '#1572B6'
        },
        {
            name: 'JavaScript',
            icon: 'fab fa-js',
            level: 80,
            color: '#F7DF1E'
        },
        {
            name: 'React',
            icon: 'fab fa-react',
            level: 75,
            color: '#61DAFB'
        },
        {
            name: 'Node.js',
            icon: 'fab fa-node',
            level: 70,
            color: '#339933'
        }
    ];

    function createSkillCards() {
        if (skillsContainer) {
            skillsContainer.innerHTML = ''; // Clear existing content

            skills.forEach(skill => {
                const skillCard = document.createElement('div');
                skillCard.classList.add('skill-card');
                
                skillCard.innerHTML = `
                    <div class="skill-icon" style="color: ${skill.color}">
                        <i class="${skill.icon}"></i>
                    </div>
                    <h3>${skill.name}</h3>
                    <div class="skill-progress">
                        <div class="skill-bar" style="width: ${skill.level}%; background-color: ${skill.color}"></div>
                    </div>
                    <span class="skill-level">${skill.level}%</span>
                `;
                
                skillsContainer.appendChild(skillCard);
            });
        }
    }

    // Call the function to create skill cards
    createSkillCards();

    // Contact Form Validation
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validateForm() {
        let isValid = true;

        // Name validation
        if (nameInput.value.trim() === '') {
            nameError.textContent = 'Name is required';
            isValid = false;
        } else {
            nameError.textContent = '';
        }

        // Email validation
        if (emailInput.value.trim() === '') {
            emailError.textContent = 'Email is required';
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            emailError.textContent = 'Invalid email format';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        // Message validation
        if (messageInput.value.trim() === '') {
            messageError.textContent = 'Message is required';
            isValid = false;
        } else {
            messageError.textContent = '';
        }

        return isValid;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (validateForm()) {
                // Here you would typically send the form data to a server
                alert('Message sent successfully!');
                contactForm.reset();
            }
        });
    }
 
});

function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.topnav .nav-links a:not(.icon)');
  const topNav = document.getElementById('myTopnav');

  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Close the responsive menu
      if (topNav.classList.contains('responsive')) {
        topNav.className = 'topnav';
      }
    });
  });
});

let countdownTime = 0;  // Store the countdown time
let timer;  // To store the setInterval ID

// Function to start the countdown
function startCountdown() {
    const timeInput = document.getElementById('countdown-input');
    const timerDisplay = document.getElementById('timer-display');
    countdownTime = parseInt(timeInput.value, 10);
    
    if (isNaN(countdownTime) || countdownTime <= 0) {
      alert('Please enter a valid number greater than 0');
      return;
    }

    // Function to format time as MM:SS
    function formatTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    timerDisplay.innerHTML = formatTime(countdownTime);
    
    // Start the countdown if not already running
    if (timer) {
      clearInterval(timer);  // Clear any previous interval
    }

    timer = setInterval(function() {
      if (countdownTime > 0) {
        countdownTime--;
        timerDisplay.innerHTML = formatTime(countdownTime);
      } else {
        clearInterval(timer);
        timerDisplay.innerHTML = '00:00';
        timeInput.value = ''; // Reset input field
      }
    }, 1000);  // Update every second
}
