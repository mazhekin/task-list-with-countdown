(function() {
    'use strict';

    angular
        .module('app')
        .controller('MyController', MyController);

    function MyController($localStorage, $timeout, $scope) {

        /*jshint validthis: true */
        var vm = this;
        vm.addNewTask = addNewTask;
        vm.deleteTask = deleteTask;
        vm.addMinutes = addMinutes;

        activate();

        ///////////////////////////////////////////////////////////////
        function format(number) {
            return number < 10 ? '0' + number : number.toString();
        }

        function initNewTask() {
            var nowPlus10 = new Date();
            nowPlus10.setTime(nowPlus10.getTime() + (10 * 60 * 1000));

            var days = format(nowPlus10.getDate());
            var month = format(nowPlus10.getMonth() + 1);
            var hours = format(nowPlus10.getHours());
            var minutes = format(nowPlus10.getMinutes());

            vm.newTask = {
                finishDate: days + '/' + month + '/' + nowPlus10.getFullYear(),
                finishTime: hours + ':' + minutes
            };
        }

        function activate() {
            initNewTask();
            vm.tasks = $localStorage.tasks || [];

            calculateTimeLeft();
        }

        function calculateTimeLeft() {
            angular.forEach(vm.tasks, function(task) {
                var date1Ms = (new Date()).getTime();
                var date2Ms = (new Date(task.finishDateTime)).getTime();

                var timeLeft = date2Ms - date1Ms;

                var totalSeconds = timeLeft / 1000;

                task.overdue = totalSeconds < 0;
                totalSeconds = task.overdue ? -totalSeconds : totalSeconds;

                var seconds = Math.abs(Math.ceil(totalSeconds % 60));

                var totalMinutes = (totalSeconds - seconds) / 60;
                var minutes = Math.ceil(totalMinutes % 60);

                var hours = Math.ceil(totalMinutes - minutes) / 60;

                task.timeLeft = format(hours) + ':' + format(minutes) + ':' + format(seconds - 1);

                if (task.overdue && (hours > 0 || minutes > 2)) {
                    deleteTask(task);
                }
            });

            $timeout(function() {
                calculateTimeLeft();
            }, 1000);
        }

        function addNewTask(form) {
            if (form.$invalid) {
                form.$setDirty();
                return;
            }

            var dateParts = vm.newTask.finishDate.split("/");
            var timeParts = vm.newTask.finishTime.split(":");
            vm.newTask.finishDateTime = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1], (new Date).getSeconds());

            delete vm.newTask.finishDate;
            delete vm.newTask.finishTime;

            vm.newTask.description = vm.newTask.description || 'Нет описания';

            vm.tasks.push(angular.copy(vm.newTask));
            $localStorage.tasks = vm.tasks;
            initNewTask();
            form.$setPristine();
        }

        function deleteTask(task) {
            var index = vm.tasks.indexOf(task);
            vm.tasks.splice(index, 1);
        }

        function addMinutes(task, minutes) {
            var finishDateTime = new Date(task.finishDateTime);
            finishDateTime.setTime(finishDateTime.getTime() + (minutes * 60 * 1000));
            task.finishDateTime = finishDateTime;
        }
    }
})();
