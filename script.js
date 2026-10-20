// ==========================================
// BODHI SMART CAFE FEEDBACK SYSTEM
// SUPABASE DATABASE VERSION
// ==========================================

(function () {

    // ==========================================
    // SUPABASE CONNECTION
    // ==========================================

    const SUPABASE_URL =
        "https://qwlgwdjdxbuekfjpnonv.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_HKQz7xdG2pZLyxCTRbQcwg_dE9_XMOI";

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


    // ==========================================
    // RATING CATEGORIES
    // ==========================================

    const ratingCategories = [
        "menuVariety",
        "taste",
        "foodQuality",
        "presentation",
        "value",
        "staffBehaviour",
        "serviceSpeed",
        "orderAccuracy",
        "helpfulness",
        "ambience",
        "cleanliness",
        "seating",
        "music"
    ];


    // ==========================================
    // STORE RATINGS
    // ==========================================

    const ratings = {};

    ratingCategories.forEach(category => {
        ratings[category] = 0;
    });


    // ==========================================
    // CREATE STAR RATINGS
    // ==========================================

    document.querySelectorAll(".stars").forEach(starContainer => {

        const ratingName = starContainer.dataset.rating;

        // Clear anything already inside
        starContainer.innerHTML = "";

        // Create 5 stars
        for (let i = 1; i <= 5; i++) {

            const star = document.createElement("span");

            star.className = "star";
            star.innerHTML = "★";
            star.setAttribute("role", "button");
            star.setAttribute("aria-label", `${i} stars`);

            star.addEventListener("click", function () {

                ratings[ratingName] = i;

                updateStars(starContainer, i);

            });

            starContainer.appendChild(star);
        }

    });


    // ==========================================
    // UPDATE STARS
    // ==========================================

    function updateStars(container, rating) {

        const stars = container.querySelectorAll(".star");

        stars.forEach((star, index) => {

            if (index < rating) {
                star.classList.add("active");
            } else {
                star.classList.remove("active");
            }

        });

    }


    // ==========================================
    // FORM
    // ==========================================

    const feedbackForm =
        document.getElementById("feedbackForm");


    // ==========================================
    // SUBMIT FEEDBACK
    // ==========================================

    feedbackForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // ==========================================
        // CHECK ALL RATINGS
        // ==========================================

        for (const category of ratingCategories) {

            if (ratings[category] === 0) {

                alert(
                    "Please give a rating for every category."
                );

                return;
            }

        }


        // ==========================================
        // GET NAME
        // ==========================================

        const customerName =
            document
                .getElementById("customerName")
                .value
                .trim();


        // ==========================================
        // GET COMMENT
        // ==========================================

        const comment =
            document
                .getElementById("comment")
                .value
                .trim();


        // ==========================================
        // VALIDATE NAME
        // ==========================================

        if (!customerName) {

            alert("Please enter your name.");

            return;
        }


        // ==========================================
        // VALIDATE COMMENT
        // ==========================================

        if (!comment) {

            alert("Please enter your comment.");

            return;
        }


        // ==========================================
        // SUBMIT BUTTON
        // ==========================================

        const submitButton =
            feedbackForm.querySelector(".submit-btn");

        const originalButtonText =
            submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";


        try {

            // ==========================================
            // SAVE TO SUPABASE
            // ==========================================

            const { error } = await supabaseClient
                .from("feedback")
                .insert({

                    name: customerName,

                    comment: comment,

                    menu_variety:
                        ratings.menuVariety,

                    taste:
                        ratings.taste,

                    food_quality:
                        ratings.foodQuality,

                    presentation:
                        ratings.presentation,

                    value:
                        ratings.value,

                    staff_behaviour:
                        ratings.staffBehaviour,

                    service_speed:
                        ratings.serviceSpeed,

                    order_accuracy:
                        ratings.orderAccuracy,

                    helpfulness:
                        ratings.helpfulness,

                    ambience:
                        ratings.ambience,

                    cleanliness:
                        ratings.cleanliness,

                    seating:
                        ratings.seating,

                    music:
                        ratings.music

                });


            // ==========================================
            // ERROR
            // ==========================================

            if (error) {

                console.error(
                    "Supabase Error:",
                    error
                );

                alert(
                    "Sorry! Your feedback could not be submitted.\n\n" +
                    error.message
                );

                return;
            }


            // ==========================================
            // SUCCESS
            // ==========================================

            alert(
                "Thank you! Your feedback has been submitted."
            );


            // Reset form
            feedbackForm.reset();


            // Reset ratings
            ratingCategories.forEach(category => {

                ratings[category] = 0;

            });


            // Reset stars
            document
                .querySelectorAll(".stars")
                .forEach(container => {

                    updateStars(container, 0);

                });


            // Reload reviews
            await displayReviews();

        }

        catch (error) {

            console.error(
                "Unexpected error:",
                error
            );

            alert(
                "Something went wrong. Please try again."
            );

        }

        finally {

            submitButton.disabled = false;
            submitButton.textContent =
                originalButtonText;

        }

    });


    // ==========================================
    // DISPLAY REVIEWS
    // ==========================================

    async function displayReviews() {

        const reviewsContainer =
            document.getElementById(
                "reviewsContainer"
            );


        // ==========================================
        // GET DATA
        // ==========================================

        const { data, error } =
            await supabaseClient
                .from("feedback")
                .select("*")
                .order("created_at", {
                    ascending: false
                });


        // ==========================================
        // DATABASE ERROR
        // ==========================================

        if (error) {

            console.error(
                "Supabase Error:",
                error
            );

            reviewsContainer.innerHTML = `

                <div class="no-reviews">

                    <h3>
                        Unable to load feedback.
                    </h3>

                    <p>
                        Please check your database connection.
                    </p>

                </div>

            `;

            return;
        }


        // ==========================================
        // CONVERT DATABASE DATA
        // ==========================================

        const feedbackList =
            (data || []).map(row => ({

                id: row.id,

                name: row.name,

                comment: row.comment,

                ratings: {

                    menuVariety:
                        row.menu_variety,

                    taste:
                        row.taste,

                    foodQuality:
                        row.food_quality,

                    presentation:
                        row.presentation,

                    value:
                        row.value,

                    staffBehaviour:
                        row.staff_behaviour,

                    serviceSpeed:
                        row.service_speed,

                    orderAccuracy:
                        row.order_accuracy,

                    helpfulness:
                        row.helpfulness,

                    ambience:
                        row.ambience,

                    cleanliness:
                        row.cleanliness,

                    seating:
                        row.seating,

                    music:
                        row.music

                },

                date:
                    new Date(
                        row.created_at
                    ).toLocaleDateString()

            }));


        // ==========================================
        // REVIEW COUNT
        // ==========================================

        document.getElementById(
            "reviewCount"
        ).textContent = feedbackList.length;


        // ==========================================
        // NO REVIEWS
        // ==========================================

        if (feedbackList.length === 0) {

            reviewsContainer.innerHTML = `

                <div class="no-reviews">

                    <h3>
                        No feedback yet.
                    </h3>

                    <p>
                        Be the first person to share
                        your experience!
                    </p>

                </div>

            `;

            document.getElementById(
                "overallRating"
            ).textContent = "0.0";

            return;
        }


        // ==========================================
        // CLEAR OLD REVIEWS
        // ==========================================

        reviewsContainer.innerHTML = "";


        // ==========================================
        // OVERALL TOTAL
        // ==========================================

        let totalRating = 0;


        // ==========================================
        // CREATE REVIEW CARDS
        // ==========================================

        feedbackList.forEach(feedback => {

            const allRatings =
                Object.values(feedback.ratings);


            const reviewAverage =
                allRatings.reduce(
                    (sum, rating) =>
                        sum + Number(rating),
                    0
                ) / allRatings.length;


            totalRating += reviewAverage;


            // ==========================================
            // REVIEW CARD
            // ==========================================

            const reviewCard =
                document.createElement("div");

            reviewCard.classList.add(
                "review-card"
            );


            reviewCard.innerHTML = `

                <div class="review-top">

                    <div class="customer-name">

                        👤
                        ${escapeHTML(
                            feedback.name
                        )}

                    </div>

                    <div class="date">

                        ${feedback.date}

                    </div>

                </div>


                <div class="review-overall">

                    ${createStars(reviewAverage)}

                    <span>

                        ${reviewAverage.toFixed(1)}/5

                    </span>

                </div>


                <div class="review-details">

                    <div class="detail-box">

                        <strong>
                            🍔 Food
                        </strong>

                        ${getFoodAverage(
                            feedback.ratings
                        )}/5

                    </div>


                    <div class="detail-box">

                        <strong>
                            👨‍🍳 Service
                        </strong>

                        ${getServiceAverage(
                            feedback.ratings
                        )}/5

                    </div>


                    <div class="detail-box">

                        <strong>
                            🏠 Experience
                        </strong>

                        ${getExperienceAverage(
                            feedback.ratings
                        )}/5

                    </div>

                </div>


                <div class="review-comment">

                    "${escapeHTML(
                        feedback.comment
                    )}"

                </div>

            `;


            reviewsContainer.appendChild(
                reviewCard
            );

        });


        // ==========================================
        // OVERALL AVERAGE
        // ==========================================

        const overallAverage =
            totalRating / feedbackList.length;


        document.getElementById(
            "overallRating"
        ).textContent =
            overallAverage.toFixed(1);

    }


    // ==========================================
    // CREATE REVIEW STARS
    // ==========================================

    function createStars(rating) {

        const roundedRating =
            Math.round(rating);

        let stars = "";

        for (let i = 1; i <= 5; i++) {

            if (i <= roundedRating) {

                stars += "★";

            } else {

                stars += "☆";

            }

        }

        return stars;
    }


    // ==========================================
    // FOOD AVERAGE
    // ==========================================

    function getFoodAverage(ratings) {

        const foodRatings = [

            ratings.menuVariety,

            ratings.taste,

            ratings.foodQuality,

            ratings.presentation,

            ratings.value

        ];

        return calculateAverage(foodRatings);
    }


    // ==========================================
    // SERVICE AVERAGE
    // ==========================================

    function getServiceAverage(ratings) {

        const serviceRatings = [

            ratings.staffBehaviour,

            ratings.serviceSpeed,

            ratings.orderAccuracy,

            ratings.helpfulness

        ];

        return calculateAverage(serviceRatings);
    }


    // ==========================================
    // EXPERIENCE AVERAGE
    // ==========================================

    function getExperienceAverage(ratings) {

        const experienceRatings = [

            ratings.ambience,

            ratings.cleanliness,

            ratings.seating,

            ratings.music

        ];

        return calculateAverage(
            experienceRatings
        );
    }


    // ==========================================
    // CALCULATE AVERAGE
    // ==========================================

    function calculateAverage(numbers) {

        const total =
            numbers.reduce(
                (sum, number) =>
                    sum + Number(number),
                0
            );

        return (
            total / numbers.length
        ).toFixed(1);
    }


    // ==========================================
    // SECURITY
    // ==========================================

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    // ==========================================
    // LOAD REVIEWS
    // ==========================================

    displayReviews();

})();