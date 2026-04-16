(function ($) {
    H5P.WordOrder = (function ($) {

        /**
         * Fisher-Yates shuffle that guarantees the result differs from the original.
         */
        function shuffle(arr) {
            var a = arr.slice();
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = a[i];
                a[i] = a[j];
                a[j] = tmp;
            }
            // If shuffle produced the original order and there are 2+ items, swap first two
            if (a.length > 1 && a.every(function (v, idx) { return v === arr[idx]; })) {
                var tmp2 = a[0];
                a[0] = a[1];
                a[1] = tmp2;
            }
            return a;
        }

        function WordOrder(params, id, contentData) {
            H5P.EventDispatcher.call(this);

            this.params = params;
            this.id = id;
            this.contentData = contentData || {};
            this.words = params.words || [];
            this.instructions = params.instructions || 'Drag and drop the words to form a correct sentence.';
            this.feedback = params.feedback || {};
            this.score = 0;
            this.answered = false;

            // l10n with defaults
            this.l10n = $.extend({
                checkAnswer: 'Check Answer',
                retry: 'Retry',
                showSolution: 'Show Solution',
                correctMessage: 'Correct! The sentence is in the right order.',
                incorrectMessage: 'Not quite right. Try again!'
            }, params.l10n);

            // Behaviour settings
            this.behaviour = $.extend({
                enableRetry: true,
                enableSolutionsButton: true
            }, params.behaviour);

            // Correct order as text array
            this.correctOrder = this.words.map(function (word) {
                return word.word || word;
            });

            // Restore previous state or shuffle
            var previousState = this.contentData.previousState;
            if (previousState && previousState.order) {
                this.currentOrder = previousState.order;
                this.answered = previousState.answered || false;
            }
            else {
                this.currentOrder = shuffle(this.correctOrder);
            }
        }

        WordOrder.prototype = Object.create(H5P.EventDispatcher.prototype);
        WordOrder.prototype.constructor = WordOrder;

        WordOrder.prototype.attach = function ($container) {
            var self = this;
            this.$container = $($container).addClass('h5p-word-order');

            // Instructions
            $('<div>')
                .addClass('h5p-word-order-instructions')
                .text(this.instructions)
                .appendTo(this.$container);

            // Sortable words container
            this.$wordsContainer = $('<div>')
                .addClass('h5p-word-order-words-container sortable')
                .appendTo(this.$container);

            this.renderWords();

            // Make the words sortable
            this.$wordsContainer.sortable({
                containment: 'parent',
                cursor: 'move',
                tolerance: 'pointer',
                delay: 150,
                distance: 5,
                items: '.h5p-word-order-word',
                update: function () {
                    self.updateCurrentOrder();
                }
            });

            // Buttons container
            this.$buttons = $('<div>')
                .addClass('h5p-word-order-buttons')
                .appendTo(this.$container);

            // Check button
            this.$checkButton = $('<button>')
                .addClass('h5p-word-order-check-button')
                .text(this.l10n.checkAnswer)
                .appendTo(this.$buttons)
                .on('click', function () {
                    self.checkAnswer();
                });

            // Retry button (hidden initially)
            this.$retryButton = $('<button>')
                .addClass('h5p-word-order-retry-button')
                .text(this.l10n.retry)
                .appendTo(this.$buttons)
                .on('click', function () {
                    self.retry();
                })
                .hide();

            // Show Solution button (hidden initially)
            this.$solutionButton = $('<button>')
                .addClass('h5p-word-order-solution-button')
                .text(this.l10n.showSolution)
                .appendTo(this.$buttons)
                .on('click', function () {
                    self.showSolution();
                })
                .hide();

            // Feedback container
            this.$feedback = $('<div>')
                .addClass('h5p-word-order-feedback')
                .appendTo(this.$container);

            // If restoring answered state, re-check to show feedback
            if (this.answered) {
                this.checkAnswer();
            }
        };

        WordOrder.prototype.renderWords = function () {
            var self = this;
            this.$wordsContainer.empty();
            this.currentOrder.forEach(function (text) {
                $('<div>')
                    .addClass('h5p-word-order-word')
                    .text(text)
                    .appendTo(self.$wordsContainer);
            });
        };

        WordOrder.prototype.updateCurrentOrder = function () {
            var order = [];
            this.$wordsContainer.find('.h5p-word-order-word').each(function () {
                order.push($(this).text());
            });
            this.currentOrder = order;
        };

        WordOrder.prototype.checkAnswer = function () {
            this.updateCurrentOrder();
            this.answered = true;

            this.score = 0;
            for (var i = 0; i < this.correctOrder.length; i++) {
                if (this.currentOrder[i] === this.correctOrder[i]) {
                    this.score++;
                }
            }

            var isCorrect = this.score === this.correctOrder.length;

            // Mark individual words
            var correctOrder = this.correctOrder;
            this.$wordsContainer.find('.h5p-word-order-word').each(function (idx) {
                var $word = $(this);
                $word.removeClass('h5p-word-correct h5p-word-incorrect');
                if ($word.text() === correctOrder[idx]) {
                    $word.addClass('h5p-word-correct');
                }
                else {
                    $word.addClass('h5p-word-incorrect');
                }
            });

            // Feedback text
            var feedbackText = isCorrect
                ? (this.l10n.correctMessage)
                : (this.l10n.incorrectMessage);

            this.$feedback
                .removeClass('correct incorrect')
                .addClass(isCorrect ? 'correct' : 'incorrect')
                .text(feedbackText);

            // Disable sortable and check button
            this.$wordsContainer.sortable('disable');
            this.$checkButton.hide();

            // Show secondary buttons
            if (!isCorrect && this.behaviour.enableRetry) {
                this.$retryButton.show();
            }
            if (!isCorrect && this.behaviour.enableSolutionsButton) {
                this.$solutionButton.show();
            }

            // xAPI
            var xAPIEvent = this.createXAPIEventTemplate('answered');
            this.addQuestionToXAPI(xAPIEvent);
            this.addResponseToXAPI(xAPIEvent);
            this.trigger(xAPIEvent);

            this.trigger('resize');
        };

        WordOrder.prototype.retry = function () {
            this.answered = false;
            this.score = 0;
            this.currentOrder = shuffle(this.correctOrder);

            this.renderWords();

            this.$wordsContainer.sortable('enable');
            this.$checkButton.show();
            this.$retryButton.hide();
            this.$solutionButton.hide();
            this.$feedback.removeClass('correct incorrect').text('');

            this.trigger('resize');
        };

        WordOrder.prototype.showSolution = function () {
            this.currentOrder = this.correctOrder.slice();
            this.renderWords();
            this.$wordsContainer.find('.h5p-word-order-word').addClass('h5p-word-solution');
            this.$wordsContainer.sortable('disable');
            this.$solutionButton.hide();

            this.trigger('resize');
        };

        WordOrder.prototype.getScore = function () {
            return this.score;
        };

        WordOrder.prototype.getMaxScore = function () {
            return this.correctOrder.length;
        };

        WordOrder.prototype.getCurrentState = function () {
            return {
                order: this.currentOrder,
                answered: this.answered
            };
        };

        WordOrder.prototype.addQuestionToXAPI = function (xAPIEvent) {
            var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
            definition.description = {
                'en-US': this.instructions
            };
            definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
            definition.interactionType = 'sequencing';
            definition.correctResponsesPattern = [
                this.correctOrder.join('[,]')
            ];
        };

        WordOrder.prototype.addResponseToXAPI = function (xAPIEvent) {
            xAPIEvent.setScoredResult(this.score, this.getMaxScore(), this,
                true, this.score === this.getMaxScore());
            xAPIEvent.data.statement.result.response = this.currentOrder.join('[,]');
        };

        return WordOrder;
    })(H5P.jQuery);
})(H5P.jQuery);
